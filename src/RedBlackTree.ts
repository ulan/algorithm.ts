export enum Color { Black, Red }

export class Node<T> {
    value : T;
    color : Color;
    parent: Node<T>;
    left: Node<T>;
    right: Node<T>;
    constructor(value: T, color : Color) {
        this.value = value;
        this.color = color;
        this.left = null;
        this.right = null;
        this.parent = null;
        this.parent = null;
    }
    child(index : number) {
        return (index === 0) ? this.left : this.right;
    }
    setChild(index : number, child : Node<T>) {
        if (child !== null) {
            child.parent = this;
        }
        if (index === 0) {
            this.left = child;
        } else {
            this.right = child;
        }
    }
}

function assert(predicate : boolean) {
    if (!predicate) throw "Error";
}

export class Tree<T> {
    root: Node<T>;
    size: number;
    compare : (a : T, b : T) => number;
    constructor(compare: (a : T, b : T) => number) {
        this.root = null;
        this.size = 0;
        this.compare = compare;
    }
    first() : T {
        let xs : T[] = [];
        Tree.collect(this.root, 1, xs);
        return xs[0];
    }
    toList(count : number) : T[] {
        let xs : T[] = [];
        Tree.collect(this.root, count, xs);
        return xs;
    }
    static collect<T>(node : Node<T>, count : number, sink : T[]) : void{
        if (node === null) return;
        Tree.collect(node.left, count, sink);
        if (sink.length === count) return;
        sink.push(node.value);
        if (sink.length === count) return;
        Tree.collect(node.right, count, sink);
    }
    contains(value : T) : boolean {
        let node = this.find(this.root, value);
        return (node !== null && node.value == value);
    }
    find(node : Node<T>, value : T) : Node<T> {
        let cc = this.compare(value, node.value);
        let next = node.child(cc < 0 ? 0 : 1);
        if (next === null || cc === 0) return node;
        return this.find(next, value);
    }
    insert(value : T) : void {
        if (this.root === null) {
            this.root = new Node<T>(value, Color.Red);
        } else {
            let parent : Node<T> = this.find(this.root, value);
            let cc = this.compare(value, parent.value);
            if (cc === 0) return;
            let node = new Node<T>(value, Color.Red);
            parent.setChild((cc < 0 ? 0 : 1), node);
            this.establishRedInvariant(node);
        }
        ++this.size;
    }
    establishRedInvariant(node : Node<T>) : void {
        let parent = node.parent;
        while (parent !== null && parent.color === Color.Red) {
            let grandparent = parent.parent;
            if (grandparent === null) {
                parent.color = Color.Black;
                break;
            } else {
                assert(grandparent.color == Color.Black);
                let uncleIndex = 1 - ((grandparent.left === parent) ? 0 : 1);
                let uncle = grandparent.child(uncleIndex);
                if (uncle !== null && uncle.color === Color.Red) {
                    parent.color = Color.Black;
                    uncle.color = Color.Black;
                    grandparent.color = Color.Red;
                    node = grandparent;
                } else {
                    node = Tree.fixRedRed(node, parent, grandparent);
                }
                parent = node.parent;
            }
        }
        if (node.parent === null && this.root != node) {
            this.root = node;
        }
    }
    static fixRedRed<T>(child : Node<T>, parent : Node<T>, grandparent : Node<T>) : Node<T> {
        assert(child.color === Color.Red);
        assert(parent.color === Color.Red);
        assert(grandparent.color === Color.Black);
        let parentIndex = grandparent.left === parent ? 0 : 1;
        let childIndex = parent.left === child ? 0 : 1;
        if (parentIndex === childIndex) {
            let siblingIndex = 1 - childIndex;
            let sibling = parent.child(siblingIndex);
            if (grandparent.parent !== null) {
                let grandparentIndex = grandparent.parent.left === grandparent ? 0 : 1;
                grandparent.parent.setChild(grandparentIndex, parent);
            } else {
                parent.parent = null;
            }
            grandparent.setChild(parentIndex, sibling);
            parent.setChild(siblingIndex, grandparent);
            child.color = Color.Black;
            return parent;
         } else {
            if (grandparent.parent !== null) {
                let grandparentIndex = grandparent.parent.left === grandparent ? 0 : 1;
                grandparent.parent.setChild(grandparentIndex, child);
            } else {
                child.parent = null;
            }
            grandparent.setChild(parentIndex, child.child(childIndex));
            parent.setChild(childIndex, child.child(parentIndex));
            child.setChild(childIndex, grandparent);
            child.setChild(parentIndex, parent);
            parent.color = Color.Black;
            return child;
         }
    }

    static predecessor<T>(node : Node<T>) {
        let pred = node.left;
        while (pred.right != null) {
            pred = pred.right;
        }
        return pred;
    }

    static successor<T>(node : Node<T>) {
        let pred = node.right;
        while (pred.left != null) {
            pred = pred.left;
        }
        return pred;
    }

    replace(node : Node<T>, new_node : Node<T>) {
        if (node.parent === null) {
            this.root = new_node;
        } else {
            node.parent.setChild(node.parent.left === node ? 0 : 1, new_node);
        }
        new_node.setChild(0, node.left);
        new_node.setChild(1, node.right);
        new_node.color = node.color;
    }

    // remove(node : Node<T>) {
    //     if (node.left !== null) {
    //         let pred : Node<T> = Tree.predecessor(node);
    //         this.remove(pred);
    //         this.replace(node, pred);
    //     } else if (node.right !== null) {
    //         let succ : Node<T> = Tree.successor(node);
    //         this.remove(succ);
    //         this.replace(node, succ);
    //     } else if (node.parent === null) {
    //         this.root = null;
    //         this.size = 0;
    //     } else {
    //         let parent = node.parent;
    //         let index = makeIndex(parent.left === node);
    //         let siblingIndex = oppositeIndex(index);
    //         let sibling = parent.getChild(siblingIndex);
    //
    //         parent.setChild(index, null);
    //         if (node.color === Color.Black) {
    //             if (parent.color === Color.Red) {
    //                 let niece = sibling.getChild(index);
    //                 if (niece === null || niece.color === Color.Black) {
    //                     this.rotateOnce(sibling);
    //                 } else {
    //                     this.rotateTwice(niece);
    //                     parent.color = Color.Black;
    //                 }
    //             }
    //         }
    //     }
    // }
    IsValidRedBlackTree() : boolean {
        return Tree.blackInvariantHolds(this.root) && Tree.redInvariantHolds(this.root);
    }
    static blackHeight<T>(node : Node<T>) : number {
        if (node === null) return 1;
        let left = Tree.blackHeight(node.left);
        let right = Tree.blackHeight(node.right);
        if (left != right) return -1;
        if (left == -1 || right == -1) return -1;
        return left + (node.color === Color.Black ? 1 : 0);
    }
    static blackInvariantHolds<T>(node : Node<T>) : boolean {
        return Tree.blackHeight(node) != -1;
    }
    static redInvariantHolds<T>(node : Node<T>) : boolean {
        if (node === null) return true;
        if (node.color === Color.Red && node.parent !== null && node.parent.color == Color.Red) {
            return false;
        }
        return Tree.redInvariantHolds(node.left) && Tree.redInvariantHolds(node.right);
    }
}
