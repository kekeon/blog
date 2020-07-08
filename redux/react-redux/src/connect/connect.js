import connectAdvanced from '../components/connectAdvanced'
import shallowEqual from '../utils/shallowEqual'
import defaultMapDispatchToPropsFactories from './mapDispatchToProps'
import defaultMapStateToPropsFactories from './mapStateToProps'
import defaultMergePropsFactories from './mergeProps'
import defaultSelectorFactory from './selectorFactory'

/*
  connect is a facade over connectAdvanced. It turns its args into a compatible
  selectorFactory, which has the signature:

    (dispatch, options) => (nextState, nextOwnProps) => nextFinalProps
  
  connect passes its args to connectAdvanced as options, which will in turn pass them to
  selectorFactory each time a Connect component instance is instantiated or hot reloaded.

  selectorFactory returns a final props selector from its mapStateToProps,
  mapStateToPropsFactories, mapDispatchToProps, mapDispatchToPropsFactories, mergeProps,
  mergePropsFactories, and pure args.

  The resulting final props selector is called by the Connect component instance whenever
  it receives new props or store state.
 */


/*

connect 是 connectAdvanced 上的高阶组件。它将其args转换为兼容的选择器，该签名器具有以下签名：
（dispatch，options）=>（nextState，nextOwnProps）=> nextFinalProps 
connect将其args传递给connectAdvanced作为选项，每次Connect时，
它们都会依次将其传递给selectorFactory。实例实例已实例化或热重载。

SelectorFactory 从其mapStateToProps，mapStateToPropsFactories，
mapDispatchToProps，mapDispatchToPropsFactories，mergeProps，
mergePropsFactories和纯args返回最终的道具选择器。每当得到新的道具或存储状态时，
Connect组件实例就会调用最终的道具道具选择器。

*/



function match(arg, factories, name) {
  for (let i = factories.length - 1; i >= 0; i--) {
    const result = factories[i](arg)
    if (result) return result
  }

  return (dispatch, options) => {
    throw new Error(
      `Invalid value of type ${typeof arg} for ${name} argument when connecting component ${
        options.wrappedComponentName
      }.`
    )
  }
}

function strictEqual(a, b) {
  return a === b
}

// createConnect with default args builds the 'official' connect behavior. Calling it with
// 使用默认args的createConnect会构建“官方”连接行为。用
// different options opens up some testing and extensibility scenarios
// 不同的选项打开了一些测试和可扩展性方案

// connectHOC: 一个重要组件，用于执行已确定的逻辑，渲染最终组件，后面会详细说。
// mapStateToPropsFactories: 对 mapStateToProps 这个传入的参数的类型选择一个合适的方法。
// mapDispatchToPropsFactories: 对 mapDispatchToProps 这个传入的参数的类型选择一个合适的方法。
// mergePropsFactories: 对 mergeProps 这个传入的参数的类型选择一个合适的方法。 
// selectorFactory: 以上3个只是简单的返回另一个合适的处理方法，它则执行这些处理方法，并且对结果定义了如何比较的逻辑。
export function createConnect({
  connectHOC = connectAdvanced,
  mapStateToPropsFactories = defaultMapStateToPropsFactories,
  mapDispatchToPropsFactories = defaultMapDispatchToPropsFactories,
  mergePropsFactories = defaultMergePropsFactories,
  selectorFactory = defaultSelectorFactory
} = {}) {

   // 返回 connect
  // connect 的三个入参
  // mapStateToProps 是个函数 （storea.getState()） => ({}), 将 返回的参数将会传递到包裹的组件中
  // mapDispatchToProps: dispatch => ({ test() {dispatch({type: '', payload: ...})} }), 将 返回的 dispatch 调用函数参数将会传递到包裹的组件中
  // mergeProps 合并 mapStateToProps， mapDispatchToProps 到 包裹组件的 props
  // options 引用官网解释 
/*
[pure = true] (Boolean): 如果为 true，connector 将执行 shouldComponentUpdate 并且浅对比 mergeProps 的结果，
避免不必要的更新，前提是当前组件是一个“纯”组件，它不依赖于任何的输入或 state 而只依赖于 props 和 Redux store 的 state。默认值为 true。
[withRef = false] (Boolean): 如果为 true，connector 会保存一个对被包装组件实例的引用，该引用通过 getWrappedInstance() 方法获得。默认值为 false
 */
  

 // 返回 connect 函数， 暂且忽略中间代码
  return function connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    {
      pure = true,
      areStatesEqual = strictEqual,
      areOwnPropsEqual = shallowEqual,
      areStatePropsEqual = shallowEqual,
      areMergedPropsEqual = shallowEqual,
      ...extraOptions
    } = {}
  ) {
    const initMapStateToProps = match(
      mapStateToProps,
      mapStateToPropsFactories,
      'mapStateToProps'
    )
    const initMapDispatchToProps = match(
      mapDispatchToProps,
      mapDispatchToPropsFactories,
      'mapDispatchToProps'
    )
    const initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps')


    // 高阶组件 connect()(component)
    // 也就是说调用 connectHOC 将会返回一个函数，函数的参数是 component 
    // 忽略下方内容， 看 connectHOC = connectAdvanced 的实现
    return connectHOC(selectorFactory, {
      // used in error messages
      methodName: 'connect',

      // used to compute Connect's displayName from the wrapped component's displayName.
      getDisplayName: name => `Connect(${name})`,

      // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
      shouldHandleStateChanges: Boolean(mapStateToProps),

      // passed through to selectorFactory
      initMapStateToProps,
      initMapDispatchToProps,
      initMergeProps,
      pure,
      areStatesEqual,
      areOwnPropsEqual,
      areStatePropsEqual,
      areMergedPropsEqual,

      // any extra options args can override defaults of connect or connectAdvanced
      ...extraOptions
    })
  }
}

export default /*#__PURE__*/ createConnect()
