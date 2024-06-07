import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common'
import { User } from '../common/decorators/user.decorator'
import { IAuthPayload } from '../common/interfaces/order.interface'
import { OrderService } from './services/order.service'
import {
  CreateOrderDto,
  VerifySlipCompleteDto,
  VerifySlipVoidDto,
} from './dtos/order.dto'
import { Order } from '@prisma/client'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RequireRoles } from '@root/common/guards/role.guard'
import { Roles } from '../common/enums/order.enum'
import { Roles as RolesDecorator } from '@root/common/decorators/role.decorator'
import { HeadersDecorator } from '@root/common/decorators/header.decorator'

@ApiTags('Private')
@HeadersDecorator()
@Controller('Private')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @ApiOkResponse()
  @Get('Header')
  header(@User() user: IAuthPayload): { user: IAuthPayload } {
    return { user }
  }

  @ApiOkResponse()
  @UseGuards(RequireRoles)
  @RolesDecorator([Roles.ADMIN, Roles.STUDENT])
  @Post()
  createOrder(@Body() body: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(body)
  }

  @ApiOkResponse()
  @UseGuards(RequireRoles)
  @RolesDecorator([Roles.STUDENT])
  @Post(':orderId/Check')
  getOrCreateOrder(
    @Param('orderId') orderId: string,
    @Body() body: CreateOrderDto,
  ): Promise<Order> {
    return this.orderService.getOrCreateOrder(orderId, body)
  }

  @ApiOkResponse()
  @UseGuards(RequireRoles)
  @RolesDecorator([Roles.ADMIN, Roles.STUDENT])
  @Get()
  getOrderByStudentIdOrOrderCode(
    @Query('studentId') studentId: string,
    @Query('orderCode') orderCode: string,
  ): Promise<Order[]> {
    return this.orderService.getOrderByStudentIdOrOrderCode(
      studentId,
      orderCode,
    )
  }

  @ApiOkResponse()
  @UseGuards(RequireRoles)
  @RolesDecorator([Roles.ADMIN])
  @Put(':orderCode/Void')
  updateOrderVoid(@Param('orderCode') orderCode: string): Promise<void> {
    return this.orderService.updateOrderStatusVoid(orderCode)
  }

  @ApiOkResponse()
  @UseGuards(RequireRoles)
  @RolesDecorator([Roles.ADMIN])
  @Put(':orderCode/Refund')
  updateOrderRefund(@Param('orderCode') orderCode: string): Promise<void> {
    return this.orderService.updateOrderStatusRefund(orderCode)
  }

  @ApiOkResponse()
  @UseGuards(RequireRoles)
  @RolesDecorator([Roles.ADMIN])
  @Put('VerifySlip/Complete')
  verifySlipComplete(
    @User() user: IAuthPayload,
    @Body() body: VerifySlipCompleteDto,
  ): Promise<void> {
    return this.orderService.verifySlipComplete({
      ...body,
      userJson: { ...user },
      userId: user.id.toString(),
    })
  }

  @ApiOkResponse()
  @UseGuards(RequireRoles)
  @RolesDecorator([Roles.ADMIN])
  @Put('VerifySlip/Void')
  verifySlipVoid(
    @User() user: IAuthPayload,
    @Body() body: VerifySlipVoidDto,
  ): Promise<void> {
    return this.orderService.verifySlipVoid({
      ...body,
      userJson: { ...user },
      userId: user.id.toString(),
    })
  }
}
