import { ActionTypes } from '../actions';
import { InitializeGame } from '../../lib/Game';
import { GameBoardItemType, GameMode } from '../../lib/Map';

/** Holds initial state */
const initialState:GameState = {...InitializeGame(), runningScore: 0, iteration: 0, autoPlay: false};

const gameReducer = (state:GameState = initialState, action: ReduxAction): GameState => {
  const { items, GhostStore, PacmanStore, pillTimer} = state;
  let { mode, runningScore, iteration, turn, autoPlay } = state;

  let newMove; let i;

  switch (action.type) {

    case ActionTypes.INIT:
      autoPlay = false;
      runningScore += PacmanStore.score;
      iteration = (iteration || 0) + 1;
      return {...InitializeGame(), runningScore, iteration, autoPlay};

    case ActionTypes.RESET:
      autoPlay = false
      runningScore = 0;
      iteration = 0;
      return {...InitializeGame(), runningScore, iteration, autoPlay};

      case ActionTypes.AUTO_PLAY:
        autoPlay = true;
        runningScore += PacmanStore.score;
        iteration = (iteration || 0) + 1;
        return {...InitializeGame(), runningScore, iteration, autoPlay};

    case ActionTypes.SET_ITEMS:
      return {...state, ...action.payload };

    case ActionTypes.TIC:

      if (mode === GameMode.PLAYING) {

        turn += 1;

        // Move Pacman
        if(autoPlay){
          newMove = PacmanStore.getAutoMove();
        }else{
          newMove = PacmanStore.getNextMove();
        }
       
        if (newMove) {
          if (items[newMove.piece.y][newMove.piece.x].type === GameBoardItemType.GHOST && pillTimer.timer === 0) {
            if(autoPlay && (iteration || 0) < 100){
              runningScore +=PacmanStore.score;
              iteration = (iteration || 0) + 1;
              return {...InitializeGame(), runningScore, iteration, autoPlay}
            }else{
              mode = GameMode.FINISHED;
            }
            
          } else {
            PacmanStore.move(newMove.piece, newMove.direction);
          }
        } else {
          PacmanStore.setDirection();
        }

        // Move Ghosts
        if (turn % 2 || (pillTimer.timer === 0)) {
          for (i = 0; i < GhostStore.length; i += 1) {
            newMove = GhostStore[i].getNextMove();
            if (newMove) {
              if (items[newMove.piece.y][newMove.piece.x].type === GameBoardItemType.PACMAN) {
                if (pillTimer.timer === 0) {
                  GhostStore[i].move(newMove.piece, newMove.direction);
                  if(autoPlay && (iteration || 0) < 100){
                    runningScore +=PacmanStore.score;
                    iteration = (iteration || 0) + 1;
                    return {...InitializeGame(), runningScore, iteration, autoPlay}
                  }else{
                    mode = GameMode.FINISHED;
                  }
                 
                } else {
                  GhostStore[i].setDirection();
                }
              } else {
                GhostStore[i].move(newMove.piece, newMove.direction);
              }
            } else {
              GhostStore[i].setDirection();
            }
          }
        }

        // Decrement Pill counter
        if (pillTimer.timer > 0) pillTimer.timer -= 1;

      }
      return {...state, items, mode, turn };

    default:
      return state;
  }
};

export default gameReducer;