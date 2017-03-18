
export class linkedList {
  
  constructor() {
    this.start = null;
    this.end = null;
  }

  makeNode() {
    return {
      data: null,
      next: null
    }
  }

  add(data) {
    if(this.start === null){
      this.start = this.makeNode();
      this.end = this.start;
    } else {
      this.end.next = this.makeNode();
      this.end = this.end.next; 
    }
    this.end.data = data; 
  }

  remove(data) {
    let current = this.start;
    let previous = this.start;
    while (current !== null) {
      if (data === current.data) {
        if (current === this.start) {
          this.start = current.next;
          return;
        }
        if (current == this.end) this.end = previous;
        previous.next = current. next;
        return;
      }
      previous = current;
      current = current.next;
    }
  }
}