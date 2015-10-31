import * as List from '../../curry.ts/src/List'

export interface Edge {
  source : number;
  target : number;
}

export class Graph <E extends Edge> {
  adjacency : E[][];
  size : number;
  constructor(size : number) {
    this.size = size;
    this.adjacency = List.map(_ => [], new Array(size));
  }
  fromEdges(edges : E[]) {
    for (var e of edges) {
      this.addEdge(e);
    }
  }
  addEdge(edge : E) {
    this.adjacency[edge.source].push(edge);
  }
  adjacent(source : number) : E[] {
    return this.adjacency[source];
  }
  map(source : number, f : (x : E) => E) {
    let edges = this.adjacent(source);
    for (let i = 0; i < edges.length; i++) {
      edges[i] = f(edges[i]);
    }
  }
  forEach(source : number, f : (x : E) => void) {
    let edges = this.adjacent(source);
    for (let i = 0; i < edges.length; i++) {
      f(edges[i]);
    }
  }
  dfs(source : number) : number [] {
    let mark = List.map(_ => 0, new Array(this.size));
    let time = 1;
    function go(node : number) {
      if (mark[node] !== 0) return;
      mark[node] = time++;
      this.forEach(node, (edge : E) => go(edge.target));
    }
    go(source);
    return mark;
  }
}
