import { GameBoardItemType, KeyToGameDirection, GameDirectionMap, GameDirectionToKeys, GameDirection, pillMax } from '../Map';
import Item from './Item';

class Pacman extends Item implements GameBoardItem {

  type:GameBoardItemType = GameBoardItemType.PACMAN;

  desiredMove: string | false = false;

  score:number = 0;

  constructor(piece:GameBoardPiece, items:GameBoardItem[][], pillTimer:GameBoardItemTimer) {
    super(piece, items, pillTimer);

    // Bind context for callback events
    this.handleKeyPress = this.handleKeyPress.bind(this);

    // Add a listener for keypresses for this object
    window.addEventListener('keypress', this.handleKeyPress, false);

  }

  /**
   * Handle a keypress from the keyboard
   * 
   * @method handleKeyPress
   * @param {KeyboardEvent} e Input event
   */
  handleKeyPress(e: KeyboardEvent): void {

    if (KeyToGameDirection[e.key.toUpperCase()]) {
      this.desiredMove = KeyToGameDirection[e.key.toUpperCase()];
    }

  }
  
  /**
   * Returns the next move from the keyboard input
   * 
   * @method getNextMove
   * @return {GameBoardItemMove | boolean} Next move
   */
  getNextMove(): GameBoardItemMove | boolean {

    const { moves } = this.piece;

    let move: GameBoardItemMove | false = false;

    // If there is a keyboard move, use it and clear it
    if (this.desiredMove) {    
      if (moves[this.desiredMove]) {
        move = {piece: moves[this.desiredMove], direction: GameDirectionMap[this.desiredMove]};
        this.desiredMove = false;
      }
    }
    
    // Otherwise, continue in the last direction
    if (!move && this.direction !== GameDirection.NONE) {
      const key = GameDirectionToKeys(this.direction);
      if (moves[key]) {
        move = {piece: moves[key], direction: this.direction};
      }
    }

    return move;

  }

  /**
   * Move Pacman and "eat" the item
   * 
   * @method move
   * @param {GameBoardPiece} piece 
   * @param {GameDirection} direction 
   */
  move(piece: GameBoardPiece, direction: GameDirection):void {

    const item = this.items[piece.y][piece.x];
    if (typeof item !== 'undefined') {
      this.score += item.type;
      //console.log(item.type)
      switch(item.type) {
        case GameBoardItemType.PILL:
          this.pillTimer.timer = pillMax;
          break;
        case GameBoardItemType.GHOST:
          if (typeof item.gotoTimeout !== 'undefined')
            item.gotoTimeout();
          break;
        default: break;
      }
    }
    this.setBackgroundItem({ type: GameBoardItemType.EMPTY });
    this.fillBackgroundItem();

    this.setPiece(piece, direction);
    this.items[piece.y][piece.x] = this;
  }

    /**
   * get highest score according to the direction of Pacman
   * so We know Ghost > Pill > Biscuit
   * 
   * @method getAutoScore
   */

  getAutoScore(desiredDirection: string, reverseDirection: string): number {

    let currentScore = -1;
    const { moves } = this.piece;

    // Check first if out next move is not behind us
    if( this.direction !== GameDirectionMap[reverseDirection] ){
      
      if( moves[desiredDirection] ){
        const desireMove = moves[desiredDirection];
        

        if (this.pillTimer.timer > 0 && this.items[desireMove.y][desireMove.x].type === GameBoardItemType.GHOST){
          currentScore +=3;
        }
        if( this.items[desireMove.y][desireMove.x].type !== GameBoardItemType.GHOST ) {
          // console.log('here'+this.items[desireMove.y][desireMove.x].type)
          currentScore = 1;
        }
        
        if( this.items[desireMove.y][desireMove.x].type === GameBoardItemType.BISCUIT ) {
          // console.log(this.items[desireMove.y][desireMove.x].type)
          currentScore +=1;
        }
       
        if( this.items[desireMove.y][desireMove.x].type === GameBoardItemType.PILL ) {
          currentScore +=2;
        }
      }
    }

    return currentScore;

  }
  /**
   * @method getAutoMove
   * @return next move
   * the goal is to maximized the score on the Auto play.
   * for that for each move I check the item that surround pacman either empty space, biscuit, pill or wall
   * and those items are rank for they score. So which ever item with the highest score will win the move.
   * If multiple direction have the same score the first item checked will win the move.
   */

  getAutoMove(): GameBoardItemMove | boolean {
    const {moves} = this.piece;
    const autoDirections = ['down','up','right','left'];
    const autoReverseDirections = ['up','down','left','right'];
    let maximumScore = 0, desiredDirection = '';

    if(moves){
      for(let currentDirection = 0; currentDirection < 4; currentDirection++){
        const currentScore = this.getAutoScore(autoDirections[currentDirection], autoReverseDirections[currentDirection]);
        if(currentScore > maximumScore){
          desiredDirection = autoDirections[currentDirection];
          maximumScore = currentScore;
        }
      }
    }
    if(desiredDirection !==''){
      return {piece: moves[desiredDirection],direction:GameDirectionMap[desiredDirection]};
    }else{
      return false
    }
  }



}

export default Pacman;