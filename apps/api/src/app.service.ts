import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  pingForHealth() {
    return { success: true };
  }
}
