export default interface IApi {
  get(url: string, config?: object): Promise<{ data: object }>
  post(url: string, data: object, config?: object): Promise<{ data: object, status: number }>
  put(url: string, data?: object, config?: object): Promise<{ data: object, status: number }>
  delete(url: string, data?: object): Promise<{ data: object, status: number }>
  setResponseInterceptor(responseHandler: (response: { data: object, status: number }) => void): void
  setRequestInterceptor(requestHandler: (config: { headers?: { [index: string]: string } }) => void): void
}
