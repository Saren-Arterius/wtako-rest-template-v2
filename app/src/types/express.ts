import type { Request } from 'express';

export interface IPRequest extends Request {
  userIP?: string,
  deviceID?: string
}

export interface User {
  address: string,
  username?: string,
  name?: string,
  description?: string,
  details?: object,
}

export interface AuthedRequest extends IPRequest {
  user?: User
}

export interface PagedRequest extends Request {
  params: {
    page?: string
  }
  page: number,
}
