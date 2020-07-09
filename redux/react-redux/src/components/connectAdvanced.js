import hoistStatics from 'hoist-non-react-statics'
import React, { useContext, useMemo, useRef, useReducer } from 'react'
import { isValidElementType, isContextConsumer } from 'react-is'
import Subscription from '../utils/Subscription'
import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect'

import { ReactReduxContext } from './Context'

// Define some constant arrays just to avoid re-creating these
const EMPTY_ARRAY = []
const NO_SUBSCRIPTION_ARRAY = [null, null]

const stringifyComponent = Comp => {
  try {
    return JSON.stringify(Comp)
  } catch (err) {
    return String(Comp)
  }
}

function storeStateUpdatesReducer(state, action) {
  const [, updateCount] = state
  return [action.payload, updateCount + 1]
}

function useIsomorphicLayoutEffectWithArgs(
  effectFunc,
  effectArgs,
  dependencies
) {
  useIsomorphicLayoutEffect(() => effectFunc(...effectArgs), dependencies)
}

function captureWrapperProps(
  lastWrapperProps,
  lastChildProps,
  renderIsScheduled,
  wrapperProps,
  actualChildProps,
  childPropsFromStoreUpdate,
  notifyNestedSubs
) {
  // We want to capture the wrapper props and child props we used for later comparisons
  lastWrapperProps.current = wrapperProps
  lastChildProps.current = actualChildProps
  renderIsScheduled.current = false

  // If the render was from a store update, clear out that reference and cascade the subscriber update
  if (childPropsFromStoreUpdate.current) {
    childPropsFromStoreUpdate.current = null
    notifyNestedSubs()
  }
}

function subscribeUpdates(
  shouldHandleStateChanges,
  store,
  subscription,
  childPropsSelector,
  lastWrapperProps,
  lastChildProps,
  renderIsScheduled,
  childPropsFromStoreUpdate,
  notifyNestedSubs,
  forceComponentUpdateDispatch
) {
  // If we're not subscribed to the store, nothing to do here
  if (!shouldHandleStateChanges) return

  // Capture values for checking if and when this component unmounts
  let didUnsubscribe = false
  let lastThrownError = null

  // We'll run this callback every time a store subscription update propagates to this component
  const checkForUpdates = () => {
    if (didUnsubscribe) {
      // Don't run stale listeners.
      // Redux doesn't guarantee unsubscriptions happen until next dispatch.
      return
    }

    const latestStoreState = store.getState()

    let newChildProps, error
    try {
      // Actually run the selector with the most recent store state and wrapper props
      // to determine what the child props should be
      newChildProps = childPropsSelector(
        latestStoreState,
        lastWrapperProps.current
      )
    } catch (e) {
      error = e
      lastThrownError = e
    }

    if (!error) {
      lastThrownError = null
    }

    // If the child props haven't changed, nothing to do here - cascade the subscription update
    if (newChildProps === lastChildProps.current) {
      if (!renderIsScheduled.current) {
        notifyNestedSubs()
      }
    } else {
      // Save references to the new child props.  Note that we track the "child props from store update"
      // as a ref instead of a useState/useReducer because we need a way to determine if that value has
      // been processed.  If this went into useState/useReducer, we couldn't clear out the value without
      // forcing another re-render, which we don't want.
      lastChildProps.current = newChildProps
      childPropsFromStoreUpdate.current = newChildProps
      renderIsScheduled.current = true

      // If the child props _did_ change (or we caught an error), this wrapper component needs to re-render
      forceComponentUpdateDispatch({
        type: 'STORE_UPDATED',
        payload: {
          error
        }
      })
    }
  }

  // Actually subscribe to the nearest connected ancestor (or store)
  subscription.onStateChange = checkForUpdates
  subscription.trySubscribe()

  // Pull data from the store after first render in case the store has
  // changed since we began.
  checkForUpdates()

  const unsubscribeWrapper = () => {
    didUnsubscribe = true
    subscription.tryUnsubscribe()
    subscription.onStateChange = null

    if (lastThrownError) {
      // It's possible that we caught an error due to a bad mapState function, but the
      // parent re-rendered without this component and we're about to unmount.
      // This shouldn't happen as long as we do top-down subscriptions correctly, but
      // if we ever do those wrong, this throw will surface the error in our tests.
      // In that case, throw the error from here so it doesn't get lost.
      throw lastThrownError
    }
  }

  return unsubscribeWrapper
}

const initStateUpdates = () => [null, 0]


// 切记 执行 connect()(component), connectAdvanced回调用， 返回一个函数
// 返回函数的入参 component, 寻找 connectAdvanced 返回值 直接拉到最后
export default function connectAdvanced(
  /*
    selectorFactory is a func that is responsible for returning the selector function used to
    compute new props from state, props, and dispatch. For example:
    selectorFactory是一个函数，负责返回用于从状态，道具和调度中计算新道具的选择器函数。例如：   

      export default connectAdvanced((dispatch, options) => (state, props) => ({
        thing: state.things[props.thingId],
        saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
      }))(YourComponent)

    Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
    outside of their selector as an optimization. Options passed to connectAdvanced are passed to
    the selectorFactory, along with displayName and WrappedComponent, as the second argument.

    工厂可以访问调度程序，因此selectorFactories可以将actionCreator绑定到其选择器之外以进行优化。传递给connectAdvanced的选项与displayName和WrappedComponent一起作为第二个参数传递给selectorFactory。

    Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
    props. Do not use connectAdvanced directly without memoizing results between calls to your
    selector, otherwise the Connect component will re-render on every state or props change.
  
    请注意，selectorFactory负责所有入站和出站道具的缓存/存储。不要在没有记住选择器调用之间的结果的情况下直接使用connectAdvanced，否则Connect组件将在每种状态或道具更改时重新呈现。
  
    */
  selectorFactory,
  // options object:
  {
    // the func used to compute this HOC's displayName from the wrapped component's displayName.
    // probably overridden by wrapper functions such as connect()
    
    // 从包装的组件的displayName计算此HOC的displayName的函数。
    //可能被包装函数（如connect（））覆盖
    getDisplayName = name => `ConnectAdvanced(${name})`,

    // 用于错误提示
    methodName = 'connectAdvanced',

   // 有REMOVED标志，这里不关注
   renderCountProp = undefined,

   // 确定connect这个HOC是否订阅state变动，好像已经没有用到了
    shouldHandleStateChanges = true,

    // 有REMOVED标志，这里不关注
    storeKey = 'store',

    // 有REMOVED标志，这里不关注
    withRef = false,

    // 是否通过 forwardRef 暴露出传入的Component的DOM
    forwardRef = false,

   // React的createContext
    context = ReactReduxContext,

    // 其余的(比较方法，参数处理方法等)将会传递给上面的 selectFactory
    ...connectOptions
  } = {}
) {
  if (process.env.NODE_ENV !== 'production') {
    if (renderCountProp !== undefined) {
      throw new Error(
        `renderCountProp is removed. render counting is built into the latest React Dev Tools profiling extension`
      )
    }
    if (withRef) {
      throw new Error(
        'withRef is removed. To access the wrapped instance, use a ref on the connected component'
      )
    }

    const customStoreWarningMessage =
      'To use a custom Redux store for specific components, create a custom React context with ' +
      "React.createContext(), and pass the context object to React Redux's Provider and specific components" +
      ' like: <Provider context={MyContext}><ConnectedComponent context={MyContext} /></Provider>. ' +
      'You may also pass a {context : MyContext} option to connect'

    if (storeKey !== 'store') {
      throw new Error(
        'storeKey has been removed and does not do anything. ' +
          customStoreWarningMessage
      )
    }
  }

  // 在调用执行 connect 生成了一个 context
  const Context = context

  // component 传入， 拉到最下方，看看返回值， 喜欢从下忘上看，然后在从上往下理一遍
  return function wrapWithConnect(WrappedComponent) {
    if (
      process.env.NODE_ENV !== 'production' &&
      !isValidElementType(WrappedComponent)
    ) {
      throw new Error(
        `You must pass a component to the function returned by ` +
          `${methodName}. Instead received ${stringifyComponent(
            WrappedComponent
          )}`
      )
    }

    const wrappedComponentName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component'

    const displayName = getDisplayName(wrappedComponentName)

    const selectorFactoryOptions = {
      ...connectOptions,
      getDisplayName,
      methodName,
      renderCountProp,
      shouldHandleStateChanges,
      storeKey,
      displayName,
      wrappedComponentName,
      WrappedComponent
    }

    const { pure } = connectOptions

    // selectorFactory 返回 pureFinalPropsSelector(nextState, nextOwnProps) : handleSubsequentCalls(nextState, nextOwnProps)
    function createChildSelector(store) {
      return selectorFactory(store.dispatch, selectorFactoryOptions)
    }

    // If we aren't running in "pure" mode, we don't want to memoize values.
    // To avoid conditionally calling hooks, we fall back to a tiny wrapper
    // that just executes the given callback immediately.
    const usePureOnlyMemo = pure ? useMemo : callback => callback()

    function ConnectFunction(props) {

      // 
      const [
        propsContext, // 组件上下文
        reactReduxForwardedRef, // dmo 暴漏转发
        wrapperProps // 其他参数
      ] = useMemo(() => {
        // Distinguish between actual "data" props that were passed to the wrapper component,
        // and values needed to control behavior (forwarded refs, alternate context instances).
        // To maintain the wrapperProps object reference, memoize this destructuring.

        //区分传递给包装器组件的实际“数据”道具，
        //和控制行为所需的值（转发的ref，备用上下文实例）。
        //要维护wrapperProps对象引用，请记住此解构。

        // 参数上的结构，
        const { reactReduxForwardedRef, ...wrapperProps } = props
        return [props.context, reactReduxForwardedRef, wrapperProps]
      }, [props])


      // 这里主要是对 上下文进行优化处理， 如果有传入CreateContext, 使用传入， 没有就是使用闭包里的 context
      // 是否有Context Consumer 消费者
      const ContextToUse = useMemo(() => {
        // Users may optionally pass in a custom context instance to use instead of our ReactReduxContext.
        // Memoize the check that determines which context instance we should use.
        return propsContext &&
          propsContext.Consumer &&
          isContextConsumer(<propsContext.Consumer />)
          ? propsContext
          : Context
      }, [propsContext, Context])

      // Retrieve the store and ancestor subscription via context, if available
      // 得到context value 生产的值
      const contextValue = useContext(ContextToUse)

      // The store _must_ exist as either a prop or in context.
      // We'll check to see if it _looks_ like a Redux store first.
      // This allows us to pass through a `store` prop that is just a plain value.

      //商店_must_作为prop或在上下文中存在。
      //我们首先检查它是否看起来像Redux商店。
      //这样，我们就可以通过只是一个普通值的`store`属性。

      // 标记是否传入  createStore() 的值
      const didStoreComeFromProps =
        Boolean(props.store) &&
        Boolean(props.store.getState) &&
        Boolean(props.store.dispatch)


      // 上下文 否传入  createStore() 的值  
      const didStoreComeFromContext =
        Boolean(contextValue) && Boolean(contextValue.store)

      if (
        process.env.NODE_ENV !== 'production' &&
        !didStoreComeFromProps &&
        !didStoreComeFromContext
      ) {
        throw new Error(
          `Could not find "store" in the context of ` +
            `"${displayName}". Either wrap the root component in a <Provider>, ` +
            `or pass a custom React context provider to <Provider> and the corresponding ` +
            `React context consumer to ${displayName} in connect options.`
        )
      }

      // Based on the previous check, one of these must be true
      // 根据之前的检查，其中一项必须为真， 优先以 props.store 为主
      const store = didStoreComeFromProps ? props.store : contextValue.store

      const childPropsSelector = useMemo(() => {
        // The child props selector needs the store reference as an input.
        // Re-create this selector whenever the store changes.
        //子道具选择器需要商店参考作为输入。
        //每当商店更改时，重新创建此选择器。
        // 返回
        return createChildSelector(store)
      }, [store])

      // 这里之前提过， Subscription 构建， 订阅/通知
      const [subscription, notifyNestedSubs] = useMemo(() => {
        if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY

        // This Subscription's source should match where store came from: props vs. context. A component
        // connected to the store via props shouldn't use subscription from context, or vice versa.
        const subscription = new Subscription(
          store,
          didStoreComeFromProps ? null : contextValue.subscription
        )

        // `notifyNestedSubs` is duplicated to handle the case where the component is unmounted in
        // the middle of the notification loop, where `subscription` will then be null. This can
        // probably be avoided if Subscription's listeners logic is changed to not call listeners
        // that have been unsubscribed in the  middle of the notification loop.
        
        // 相关参数变化， 就会引起子组件更新
        const notifyNestedSubs = subscription.notifyNestedSubs.bind(
          subscription
        )

        return [subscription, notifyNestedSubs]
      }, [store, didStoreComeFromProps, contextValue])

      // Determine what {store, subscription} value should be put into nested context, if necessary,
      // and memoize that value to avoid unnecessary context updates.
      //确定应该在嵌套上下文中放入哪个{store，subscription}值，
      //并记住该值以避免不必要的上下文更新。
      const overriddenContextValue = useMemo(() => {
        if (didStoreComeFromProps) {
          // This component is directly subscribed to a store from props.
          // We don't want descendants reading from this store - pass down whatever
          // the existing context value is from the nearest connected ancestor.

          //此组件是通过props直接订阅store的。
          //我们不希望后代从该存储中读取-传递现有上下文值来自最近连接的祖先的任何值。
          return contextValue
        }

        // Otherwise, put this component's subscription instance into context, so that
        // connected descendants won't update until after this component is done
        return {
          ...contextValue,
          subscription
        }
      }, [didStoreComeFromProps, contextValue, subscription])

      // We need to force this wrapper component to re-render whenever a Redux store update
      // causes a change to the calculated child component props (or we caught an error in mapState)
     //每当Redux商店更新导致
     //所计算的子组件props发生更改时，
     //我们都需要强制重新渲染该包装器组件（或者我们在mapState中发现错误）
     //强制更新渲染
      const [
        [previousStateUpdateResult],
        forceComponentUpdateDispatch
      ] = useReducer(storeStateUpdatesReducer, EMPTY_ARRAY, initStateUpdates)

      // Propagate any mapState/mapDispatch errors upwards
      if (previousStateUpdateResult && previousStateUpdateResult.error) {
        throw previousStateUpdateResult.error
      }

      // Set up refs to coordinate values between the subscription effect and the render logic
      const lastChildProps = useRef()
      const lastWrapperProps = useRef(wrapperProps)
      const childPropsFromStoreUpdate = useRef()
      const renderIsScheduled = useRef(false)

      const actualChildProps = usePureOnlyMemo(() => {
        // Tricky logic here:
        // - This render may have been triggered by a Redux store update that produced new child props
        // - However, we may have gotten new wrapper props after that
        // If we have new child props, and the same wrapper props, we know we should use the new child props as-is.
        // But, if we have new wrapper props, those might change the child props, so we have to recalculate things.
        // So, we'll use the child props from store update only if the wrapper props are the same as last time.
        
        //这里的棘手逻辑：
        //-此渲染可能是由R​​edux商店更新触发的，该更新生成了新的子道具
        ///-但是，在此之后，我们可能已经获得了新的包装器道具//
         //如果我们有新的子道具，并且同样的包装道具，我们知道我们应该照原样使用新的子道具。
         //但是，如果我们有新的包装道具，则这些道具可能会更改子道具，因此我们必须重新计算。
        //因此，仅当包装道具与上次相同时，我们才会使用商店更新中的子道具。
        if (
          childPropsFromStoreUpdate.current &&
          wrapperProps === lastWrapperProps.current
        ) {
          return childPropsFromStoreUpdate.current
        }

        // TODO We're reading the store directly in render() here. Bad idea?
        // This will likely cause Bad Things (TM) to happen in Concurrent Mode.
        // Note that we do this because on renders _not_ caused by store updates, we need the latest store state
        // to determine what the child props should be.
        
        // TODO我们在这里直接在render（）中读取商店。馊主意？
        //这很可能会导致在并行模式下发生不良事件（TM）。
        //注意我们这样做是因为在由商店更新引起的渲染_not_上，我们需要最新的商店状态
        //来确定子道具应该是什么。
        // 最终的目的是将， store: (state => {}), 合并到 wrapperProps 参数中
        return childPropsSelector(store.getState(), wrapperProps)
      }, [store, previousStateUpdateResult, wrapperProps])

      // We need this to execute synchronously every time we re-render. However, React warns
      // about useLayoutEffect in SSR, so we try to detect environment and fall back to
      // just useEffect instead to avoid the warning, since neither will run anyway.

      //每次重新渲染时，我们都需要此同步执行。然而，React警告
      //有关SSR中的useLayoutEffect，因此我们尝试检测环境并回落到
      //仅使用useEffect以避免该警告，因为两者都不会运行。


      useIsomorphicLayoutEffectWithArgs(captureWrapperProps, [
        lastWrapperProps,
        lastChildProps,
        renderIsScheduled,
        wrapperProps,
        actualChildProps,
        childPropsFromStoreUpdate,
        notifyNestedSubs
      ])

      // Our re-subscribe logic only runs when the store/subscription setup changes
      // //我们的重新订阅逻辑仅在存储/订阅设置更改时运行
      useIsomorphicLayoutEffectWithArgs(
        subscribeUpdates,
        [
          shouldHandleStateChanges,
          store,
          subscription,
          childPropsSelector,
          lastWrapperProps,
          lastChildProps,
          renderIsScheduled,
          childPropsFromStoreUpdate,
          notifyNestedSubs,
          forceComponentUpdateDispatch
        ],
        [store, subscription, childPropsSelector]
      )

      // Now that all that's done, we can finally try to actually render the child component.
      // We memoize the elements for the rendered child component as an optimization.
      // 完成所有步骤后，我们终于可以尝试实际渲染子组件。
      // 我们将呈现的子组件的元素记忆为一种优化。
      // 优化传入组建渲染
      const renderedWrappedComponent = useMemo(
        () => (
          <WrappedComponent
            {...actualChildProps}
            ref={reactReduxForwardedRef}
          />
        ),
        [reactReduxForwardedRef, WrappedComponent, actualChildProps]
      )

      // If React sees the exact same element reference as last time, it bails out of re-rendering
      // that child, same as if it was wrapped in React.memo() or returned false from shouldComponentUpdate.
      
      //如果React看到的元素引用与上次完全相同，那么它将避免重新渲染
      //那个孩子，就像它被包裹在React.memo（）或从shouldComponentUpdate返回false一样。
      const renderedChild = useMemo(() => {
        if (shouldHandleStateChanges) {
          // If this component is subscribed to store updates, we need to pass its own
          // subscription instance down to our descendants. That means rendering the same
          // Context instance, and putting a different value into the context.

          // 如果此组件已订阅存储更新，则需要将其
          // 订阅实例向下传递给我们的后代。这意味着呈现相同的
          // Context实例，并将不同的值放入上下文中。
          // 上下文生产者
          // overriddenContextValue 传入参数
          return (
            <ContextToUse.Provider value={overriddenContextValue}>
              {renderedWrappedComponent}
            </ContextToUse.Provider>
          )
        }

        return renderedWrappedComponent
      }, [ContextToUse, renderedWrappedComponent, overriddenContextValue])

      return renderedChild
    }

    // If we're in "pure" mode, ensure our wrapper component only re-renders when incoming props have changed.
    // 如果我们处于“纯”模式，请确保包装器组件仅在传入道具发生更改时才重新渲染。
    // 发现是经过 memo 过的组件， 接着看 ConnectFunction 的实现
    const Connect = pure ? React.memo(ConnectFunction) : ConnectFunction

    Connect.WrappedComponent = WrappedComponent
    Connect.displayName = displayName

    // 看看 是否需要转发, 暴露出传入的Component的DOM
    if (forwardRef) {
      const forwarded = React.forwardRef(function forwardConnectRef(
        props,
        ref
      ) {
        return <Connect {...props} reactReduxForwardedRef={ref} />
      })

      forwarded.displayName = displayName
      forwarded.WrappedComponent = WrappedComponent
      return hoistStatics(forwarded, WrappedComponent)
    }

    // hoistStatics(target, source)， 将 source 中 static 修饰过的方法，转到 target 中
    // 那就主要看 Connect 实现
    return hoistStatics(Connect, WrappedComponent)
  }
}
