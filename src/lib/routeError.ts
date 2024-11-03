export class RouteError<T> extends Error {
  data: T;
  type: number;

  constructor(message: string, type: number, data: T) {
    super(message);
    this.type = type;
    this.data = data;
  }
}
