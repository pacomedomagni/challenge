export enum ActionTypes {
  SET_ITEMS = 0,
  TIC = 1,
  INIT = 2,
  RESET = 3,
  AUTO_PLAY = 4
}

export const initGame = () => ({
  type: ActionTypes.INIT,
  payload: {}
});

export const startAutoGame = () => ({
  type: ActionTypes.AUTO_PLAY,
  payload: {}
});

export const resetScore = () => ({
  type: ActionTypes.RESET,
  payload: {}
});

export const setItems = (items:GameBoardItem[][]) => ({
  type: ActionTypes.SET_ITEMS,
  payload: {
    items
  }
});

export const tic = () => ({
  type: ActionTypes.TIC,
  payload: {}
});