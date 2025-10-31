import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {

  constructor(
    @InjectConnection() private connection: Connection
  ) {
    this.checkDBConnection();
  }

  checkDBConnection() {
    const state = this.connection.readyState;
    if (state === 1) console.log("DB connected");
    else if (state === 0) console.log("DB disconnected");
  }

  getHello(): string {
    return 'Hello World!';
  }
}
