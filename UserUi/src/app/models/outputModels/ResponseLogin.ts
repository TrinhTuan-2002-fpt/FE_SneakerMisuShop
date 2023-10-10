import { ResponseBase } from './ResponseBase';

export class ResponseLogin extends ResponseBase {
  email!: any;
  username!: string;
  id!: string;
  token!: string;
}

