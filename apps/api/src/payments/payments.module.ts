import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { AuthModule } from "../auth/auth.module";
import { WalletModule } from "../wallet/wallet.module";

@Module({
  imports: [AuthModule, WalletModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
