export class ApiError extends Error {
  constructor(public status: number, public publicMessage: string) {
    super(publicMessage);
  }
}
