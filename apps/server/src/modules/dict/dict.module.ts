import { Module } from '@nestjs/common';
import { DictService } from './dict.service';
import { DictController } from './dict.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DictController],
  providers: [DictService],
})
export class DictModule {}
