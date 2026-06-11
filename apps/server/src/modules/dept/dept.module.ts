import { Module } from '@nestjs/common';
import { DeptService } from './dept.service';
import { DeptController } from './dept.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeptController],
  providers: [DeptService],
})
export class DeptModule {}
