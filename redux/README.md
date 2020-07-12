###  [Redux 阅读笔记](https://github.com/kekeon/blog/tree/master/redux)

#### 目录介绍及参考资料

- source_code 源码注释翻译
- record_md 源码阅读笔记
- [Redux 中文文档](https://www.redux.org.cn/)

#### 基本概念

- Store：全局 state 管理对象， 主要是用来消费

- Action：触发的动作事件

- Reducer：动作触发修改 state 方法

> 三者之间的关系及简单理解，不对的大家多多指教， 首先创建全局Store 管理 state, 通过 dispatch 提交 action 触发 reducer 函数修改 store 中的 state

#### 从 counter examples 读源码

> 这里主要了解一下 store 的创建， 以及 store 的消费 和 state 更新
> createStore， 创建store， 关注入参和出参

```js

import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import Counter from './components/Counter'
import counter from './reducers'

// 入参是 reducer 在 reducers/index.js， 方便看先贴出来

/* 入参 counter start */

export default (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}
/*  入参 counter end */

const store = createStore(counter)

/* store Object 出参 start */

const store = {
     dispatch: dispatch as Dispatch<A>,
     subscribe,
     getState,
     replaceReducer,
    [$$observable]: observable
}

return store;
/* 出参 end */

const rootEl = document.getElementById('root')


// 在这里边使用了， 返回store 中的 getState 、 dispatch 、 subscribe 三个方法，下面将揭示三者之间的关系

const render = () => ReactDOM.render(
  <Counter
    value={store.getState()}
    onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
    onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
  />,
  rootEl
)

render()

store.subscribe(render)

```

> 在这里用到的发布/订阅模式来实现, 不了解的自行查询哦

1. 先看一下 [createStore](https://github.com/kekeon/blog/tree/master/redux/source_code/src/createStore.ts) 中的 89 行， 先不要关注其他的

2. currentReducer 就是传进来的 counter

3. currentState 就是 store.getState() 的返回值，例子中没有默认值就是 undefined

4. store.subscribe(render) ，这里订阅了 render 这个组件方法, 返回值：unsubscribe 取消订阅

5. 在 subscribe 中 nextListeners.push(listener) 会把 render push 到 nextListeners中

6. dispatch 的实现

```js
// 删减版代码

  function dispatch(action: A) {

    try {
      isDispatching = true
      // 结合 Counter 示例 currentReducer 就是 counter 函数， 根据 action.type, 修改 state

      // currentReducer 返回的 state 会更新到 currentState
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    // 监听队列， 中存放一个 render 方法
    const listeners = (currentListeners = nextListeners)
  
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      // 在此调用 render 方法渲染, 渲染中会 调用 getState 获取 currentState
      listener()
    }

    return action
  }
```

> 总结： 通过上面的大概了解 redux 的设计，中 使用发布/订阅模式来实现，深入了解往下看

#### TODO MVC examples  深入了解 React-Redux

> createStore， 创建store， 关注入参和出参

```js
import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import App from './components/App'
import reducer from './reducers'
import 'todomvc-app-css/index.css'

/**
 * 1. Provider context 全局消费者 store
 */

const store = createStore(reducer)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

```

> 接下来我们能看下 react-redux 中 Provider 组件的实现

```js

// 下面我们一样来看下入参

import React, { useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ReactReduxContext } from './Context'
import Subscription from '../utils/Subscription'

// 我们看见内部大多用 hooks 实现
function Provider({ store, context, children }) {

  // memo store
  const contextValue = useMemo(() => {

  // 深挖 Subscription 的实现；
  // Subscription  constructor(store, parentSub) {}
  // 这里只是用了一个参数
    const subscription = new Subscription(store)
    // 默认 notifyNestedSubs 是 notify 空函数
    subscription.onStateChange = subscription.notifyNestedSubs
    return {
      store,
      subscription
    }
  }, [store])

 // memo state
  const previousState = useMemo(() => store.getState(), [store])


  useEffect(() => {
    const { subscription } = contextValue

    // 重点， 生成订阅队列
    subscription.trySubscribe()

    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs()
    }
    return () => {
      subscription.tryUnsubscribe()
      subscription.onStateChange = null
    }
  }, [contextValue, previousState])

  const Context = context || ReactReduxContext

  return <Context.Provider value={contextValue}>{children}</Context.Provider>
}


// store: 构建 (createStore)必穿， context、children，不必传
if (process.env.NODE_ENV !== 'production') {
  Provider.propTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    }),
    context: PropTypes.object,
    children: PropTypes.any
  }
}

export default Provider
```

#### 1. 深挖 [Subscription](https://github.com/kekeon/blog/tree/master/redux/react-redux/src/utils/Subscription.js) 的实现

```js

export default class Subscription {
  // 两个参数 store, parentSub
  constructor(store, parentSub) {
    this.store = store
    this.parentSub = parentSub
    this.unsubscribe = null
    this.listeners = nullListeners

    this.handleChangeWrapper = this.handleChangeWrapper.bind(this)
  }

 //
  addNestedSub(listener) {
    this.trySubscribe()
    return this.listeners.subscribe(listener)
  }

  notifyNestedSubs() {
    this.listeners.notify()
  }

  handleChangeWrapper() {
    if (this.onStateChange) {
      this.onStateChange()
    }
  }

  isSubscribed() {
    return Boolean(this.unsubscribe)
  }

  trySubscribe() {
    if (!this.unsubscribe) {
      this.unsubscribe = this.parentSub
        ? this.parentSub.addNestedSub(this.handleChangeWrapper)
        : this.store.subscribe(this.handleChangeWrapper)

      this.listeners = createListenerCollection()
    }
  }

  tryUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
      this.listeners.clear()
      this.listeners = nullListeners
    }
  }
}

```

####  2. 看一下 App 中的 Header 组件

```js

// src/containers/Header

import { connect } from 'react-redux'
import Header from '../components/Header'
import { addTodo } from '../actions'

// 通过 connect 包装过的组件
export default connect(null, { addTodo })(Header)

// react-redux/src/connect/connect
```

####  3. 探索 [connect](https://github.com/kekeon/blog/tree/master/redux/react-redux/src/connect/connect.js)

```js

// 细看源码，我们看到了许多的闭包的使用，嵌套很多，导致不易阅读， 在这里我们看几个核心的点

// 建议点击连接， 一起看着源码读文档
// 上面提到的使用时的代码: export default connect(null, { addTodo })(Header)

// 导出 connect
 export default /*#__PURE__*/ createConnect()

// createConnect 调用返回函数

// connect()(component), 返回的函数再次包裹组件， 将组件作为参数传入

// 源码中发现 connectHOC 是 connect 的核心代码
```

####  4. 接着看 [connectHoc](https://github.com/kekeon/blog/tree/master/redux/react-redux/src/components/connectAdvanced.js) 删减版本， 点击连接看源码

```js

export default function connectAdvanced (
  selectorFactory,
  // options object:
  {
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
    ...connectOptions

    /*
    connectOptions： 主要包含如下参数
     initMapStateToProps,
      initMapDispatchToProps,
      initMergeProps,
      pure,
      areStatesEqual,
      areOwnPropsEqual,
      areStatePropsEqual,
      areMergedPropsEqual,

      先关注完入参，在关注出参
    */
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

  const Context = context

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

    function createChildSelector(store) {
      return selectorFactory(store.dispatch, selectorFactoryOptions)
    }

    const usePureOnlyMemo = pure ? useMemo : callback => callback()

    function ConnectFunction(props) {
      const [
        propsContext,
        reactReduxForwardedRef,
        wrapperProps
      ] = useMemo(() => {
          //区分传递给包装器组件的实际“数据”道具，
        //和控制行为所需的值（转发的ref，备用上下文实例）。
        //要维护wrapperProps对象引用，请记住此解构。
        // 参数上的结构
        const { reactReduxForwardedRef, ...wrapperProps } = props
        return [props.context, reactReduxForwardedRef, wrapperProps]
      }, [props])

      // 检查上下文是否出现context消费者
      const ContextToUse = useMemo(() => {
        return propsContext &&
          propsContext.Consumer &&
          isContextConsumer(<propsContext.Consumer />)
          ? propsContext
          : Context
      }, [propsContext, Context])

      // 得到context value 生产的值
      const contextValue = useContext(ContextToUse)

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
      const store = didStoreComeFromProps ? props.store : contextValue.store

      const childPropsSelector = useMemo(() => {

        return createChildSelector(store)
      }, [store])

      const [subscription, notifyNestedSubs] = useMemo(() => {
        if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY

      const subscription = new Subscription(
          store,
          didStoreComeFromProps ? null : contextValue.subscription
        )

        // 相关参数变化， 就会引起子组件更新
        const notifyNestedSubs = subscription.notifyNestedSubs.bind(
          subscription
        )

        return [subscription, notifyNestedSubs]
      }, [store, didStoreComeFromProps, contextValue])


      //确定应该在嵌套上下文中放入哪个{store，subscription}值，
      //并记住该值以避免不必要的上下文更新。
      const overriddenContextValue = useMemo(() => {
        if (didStoreComeFromProps) {

          //此组件是通过props直接订阅store的。
          //我们不希望后代从该存储中读取-传递现有上下文值来自最近连接的祖先的任何值
          return contextValue
        }

           return {
          ...contextValue,
          subscription
        }
      }, [didStoreComeFromProps, contextValue, subscription])

     //每当Redux商店更新导致
     //所计算的子组件props发生更改时，
     //我们都需要强制重新渲染该包装器组件（或者我们在mapState中发现错误）
     //强制更新渲染
      const [
        [previousStateUpdateResult],
        forceComponentUpdateDispatch
      ] = useReducer(storeStateUpdatesReducer, EMPTY_ARRAY, initStateUpdates)

      if (previousStateUpdateResult && previousStateUpdateResult.error) {
        throw previousStateUpdateResult.error
      }
      const lastChildProps = useRef()
      const lastWrapperProps = useRef(wrapperProps)
      const childPropsFromStoreUpdate = useRef()
      const renderIsScheduled = useRef(false)
      const actualChildProps = usePureOnlyMemo(() => {

        if (
          childPropsFromStoreUpdate.current &&
          wrapperProps === lastWrapperProps.current
        ) {
          return childPropsFromStoreUpdate.current
        }


        // 通过阅读 selectorFactory， 最终的目的是将， store: (state => {}), 合并到 wrapperProps 参数中
        // 所以最终 actualChildProps 参数中将包含函数返回的参数
        return childPropsSelector(store.getState(), wrapperProps)
      }, [store, previousStateUpdateResult, wrapperProps])

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

      //我们的重新订阅逻辑仅在存储/订阅设置更改时运行
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

      // 完成所有步骤后，我们终于可以尝试实际渲染子组件。
      // 我们将呈现的子组件的元素useMemo使用优化。
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

      //如果React看到的元素引用与上次完全相同，那么它将避免重新渲染
      //那个孩子，就像它被包裹在React.memo（）或从shouldComponentUpdate返回false一样。
      const renderedChild = useMemo(() => {
        if (shouldHandleStateChanges) {
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
```

####  5. 回看 [connect](https://github.com/kekeon/blog/tree/master/redux/react-redux/src/connect/connect.js) 中 [selectorFactory](https://github.com/kekeon/blog/tree/master/redux/react-redux/src/connect/selectorFactory.js) 和 [wrapMapToProps](https://github.com/kekeon/blog/tree/master/redux/react-redux/src/connect/wrapMapToProps.js)

```js

    // mapStateToPropsFactories = [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing]

    // initMapStateToProps 是函数， 下方是入参：出参
    // initMapStateToProps =
    // function initProxySelector (dispatch, { displayName }) :  (function mapToPropsProxy(stateOrDispatch, ownProps): proxy.mapToProps(stateOrDispatch))

    // 其中 mapToProps， 就是 mapStateToProps = （stateOrDispatch, ownProps)： ({})
    // 如果 mapStateToProps 为 null , 则 initMapStateToProps 将会是 () : {}
    const initMapStateToProps = match(
      mapStateToProps,
      mapStateToPropsFactories,
      'mapStateToProps'
    )

    // 点击标题连接进入源码看这块的注释，结合 wrapMapToProps 和 selectorFactory
    // 里边使用了，大量闭包，用来共享参数，嵌套很多，阅读起来比较费劲
    // 其中 selectorFactory 中是用来对比参数，然后做参数合并
    // wrapMapToProps 实现了参数 state 映射到组件 props 理
```

####  6. 关于 connect 的小总结

```js

// 1. 主要还是使用了 订阅/发布的设计模式来实现
// 2. 使用 react.Context 实现组件上下文参数共享
// 3. 使用了大量 useMemo 等 hooks 来优化渲染操作
// 4. 通过高阶组件的方式实现参数混入
// 5. 注意 react-redux 只有 import { ReactReduxContext } from './Context'， 这一个地方创建 Context， 所以所有 store 都是一样的
```