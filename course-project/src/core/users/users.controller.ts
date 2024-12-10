import { Controller, Get, Param, Post, Delete, Body, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/oauth2.guard";

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
  @UseGuards(JwtAuthGuard)
  async deleteOne(@Param("id") userId: number) {
    await this.usersService.deleteUser(userId);
    return { message: "User deleted successfully" };
  }
}
