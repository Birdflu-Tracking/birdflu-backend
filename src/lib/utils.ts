export enum ResponseCodes {
  INTERNAL_SERVER_ERROR = 500,
  CREATED = 201,
  CREATION_FAILED = 409,
  NOT_FOUND = 404,
}


export const getCounts = (records: Array<string>, search: string) => {
  return records.filter((item) => item === search).length
}