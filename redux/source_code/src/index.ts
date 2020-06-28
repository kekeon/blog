// functions
import createStore from './createStore'
import combineReducers from './combineReducers'
import bindActionCreators from './bindActionCreators'
import applyMiddleware from './applyMiddleware'
import compose from './compose'
import warning from './utils/warning'
import __DO_NOT_USE__ActionTypes from './utils/actionTypes'

// types
// store
export {
  CombinedState,
  PreloadedState,
  Dispatch,
  Unsubscribe,
  Observable,
  Observer,
  Store,
  StoreCreator,
  StoreEnhancer,
  StoreEnhancerStoreCreator,
  ExtendState
} from './types/store'
// reducers
export {
  Reducer,
  ReducerFromReducersMapObject,
  ReducersMapObject,
  StateFromReducersMapObject,
  ActionFromReducer,
  ActionFromReducersMapObject
} from './types/reducers'
// action creators
export { ActionCreator, ActionCreatorsMapObject } from './types/actions'
// middleware
export { MiddlewareAPI, Middleware } from './types/middleware'
// actions
export { Action, AnyAction } from './types/actions'

/*
 * This is a dummy function to check if the function name has been altered by minification.
 * If the function has been minified and NODE_ENV !== 'production', warn the user.
 */

/*
 *这是一个虚拟函数，用于检查功能名称是否已通过缩小进行了更改。
 *如果函数已缩小并且NODE_ENV！=='production'，则警告用户。
 */
function isCrushed() {}

if (
  process.env.NODE_ENV !== 'production' &&
  typeof isCrushed.name === 'string' &&
  isCrushed.name !== 'isCrushed'
) {

  /** 
   * 
   * 
   * 您当前正在使用NODE_ENV ===“ production”之外的缩小代码。
   * 这意味着您正在运行较慢的Redux开发版本。
   * 您可以使用宽松的envify（https://github.com/zertosh/loose-envify）
   * 进行浏览器化或将模式设置为webpack的生产环境
   * （https://webpack.js.org/concepts/mode/），
   * 以确保您拥有适用于您的生产版本的正确代码
   * 
   * 
   * // 生产环境代码告警
   * 项目代码在生产环境下会对代码内容进行一个深度压缩，
   * 会将所有的变量名替换成 a, b, c 之类的字母，
   *  所以当进行生成环境编译后 函数 isCrushed 可以就变成了 函数 i 。这个函数的主要作用就是防止开发者在开发环境下对代码进行压缩， 影响调试
   * 
   * 
  */
  warning(
    'You are currently using minified code outside of NODE_ENV === "production". ' +
      'This means that you are running a slower development build of Redux. ' +
      'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' +
      'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' +
      'to ensure you have the correct code for your production build.'
  )
}

export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes
}
