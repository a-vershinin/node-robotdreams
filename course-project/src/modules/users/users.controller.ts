import { Controller, Get, Param, Post, Delete, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(":id")
  async findOne(@Param("id") userId: number) {
    return this.usersService.findOneById(userId);
  }

  @Post()
  async create(@Body() body: { username: string; password: string }) {
    return await this.usersService.createUser(body.username, body.password);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteOne(@Param("id") userId: number) {
    await this.usersService.deleteUser(userId);
    return { message: "User deleted successfully" };
  }
}
