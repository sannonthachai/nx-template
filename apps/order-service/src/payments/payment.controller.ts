import { TransferService } from './services/transfer.service'
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { IRedirectPayment } from '../common/interfaces/payment.interface'
import { CreateTransferDto, Installment2c2pDto } from './dtos/payment.dto'
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'
import { QrCodeDto } from './dtos/qrcode.dto'
import { IGbpayWebhook } from './interfaces/qrcode.interface'
import { IAuthPayload } from '../common/interfaces/order.interface'
import { User } from '../common/decorators/user.decorator'
import { IDoPaymentResponse2c2p } from './interfaces/2c2p.interface'
import { PaymentService } from './services/payment.service'
import { OmiseService } from './services/omise.service'
import {
  ChargeCreditCardDto,
  InstallmentsChargeCreditCardDto,
} from './dtos/payment.dto'
import { RequireRoles } from '@root/common/guards/role.guard'
import { Roles as RolesDecorator } from '@root/common/decorators/role.decorator'
import { Roles } from '../common/enums/order.enum'
import { Observable } from 'rxjs'
import { HeadersDecorator } from '@root/common/decorators/header.decorator'

@ApiTags('Private/Payments')
@HeadersDecorator()
@Controller('Private/Payments')
export class PrivatePaymentController {
  constructor(
    private readonly transferService: TransferService,
    private readonly paymentService: PaymentService,
    private readonly omiseService: OmiseService,
  ) {}

  @ApiCreatedResponse({ status: 201, type: String })
  @UseGuards(RequireRoles)
  @RolesDecorator([Roles.STUDENT])
  @Post('Gbpay/Qrcode')
  getPaymentQrCode(@Body() data: QrCodeDto): Promise<string> {
    return this.paymentService.getPaymentQrCode(data)
  }

  @ApiCreatedResponse({ status: 201, type: String })
  @UseGuards(RequireRoles)
  @RolesDecorator([Roles.STUDENT])
  @Post('2c2p/Installments')
  installment2c2p(
    @Body() data: Installment2c2pDto,
    @User() user: IAuthPayload,
  ): Promise<IDoPaymentResponse2c2p> {
    return this.paymentService.installment2c2p(data, user.clientIP)
  }

  @ApiOkResponse()
  @UseGuards(RequireRoles)
  @RolesDecorator([Roles.STUDENT])
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('slip'))
  @ApiConsumes('multipart/form-data')
  @Post('Transfer')
  transferPaymentOrder(
    @UploadedFile() slip: File[],
    @Body() data: CreateTransferDto,
  ): Promise<IRedirectPayment> {
    return this.transferService.transferPaymentOrder({
      ...data,
      slip,
    })
  }

  @ApiOkResponse()
  @UseGuards(RequireRoles)
  @RolesDecorator([Roles.STUDENT])
  @Post('Omise/Charge')
  async creditCardPaymentOrder(
    @Body() payload: ChargeCreditCardDto,
  ): Promise<Observable<IRedirectPayment>> {
    return await this.omiseService.chargeCreditCard(payload)
  }

  @ApiOkResponse()
  @UseGuards(RequireRoles)
  @RolesDecorator([Roles.STUDENT])
  @Post('Omise/Installments')
  async creditCardInstallmentsPaymentOrder(
    @Body() payload: InstallmentsChargeCreditCardDto,
  ): Promise<Observable<IRedirectPayment>> {
    return await this.omiseService.installmentsChargeCreditCard(payload)
  }
}

@ApiTags('Public/Payments')
@Controller('Public/Payments')
export class PublicPaymentController {
  constructor(
    private readonly omiseService: OmiseService,
    private readonly paymentService: PaymentService,
  ) {}

  @ApiOkResponse()
  @Post('Qrcode/:instanceCode/Webhook')
  webhookQrcode(
    @Body() payload: IGbpayWebhook,
    @Param('instanceCode') instanceCode: string,
  ) {
    return this.paymentService.webhookQrcode(instanceCode, payload)
  }

  @ApiOkResponse()
  @Post('2c2p/:instanceCode/Webhook')
  webhookInstallment2c2p(
    @Body() payload: any,
    @Param('instanceCode') instanceCode: string,
  ): Promise<Observable<string>> {
    return this.paymentService.webhookInstallment2c2p(instanceCode, payload)
  }

  @ApiOkResponse()
  @Post('Omise/Webhook')
  webhookOmise(@Body() payload: any): Promise<Observable<string>> {
    return this.omiseService.webhookOmise(
      payload,
      {
        amount: payload.data.amount,
        metadata: payload.data.metadata,
        net: payload.data.net,
        status: payload.data.status,
        card: payload.data.card ? { bank: payload.data.card.bank } : null,
        source: payload.data.source
          ? {
              installmentTerm: payload.data.source.installment_term,
            }
          : null,
      }
    )
  }
}
