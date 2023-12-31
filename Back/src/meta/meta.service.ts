import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMetaDto } from './dto/create-meta.dto';
import { UpdateMetaDto } from './dto/update-meta.dto';
import { EntityManager } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Metasorderby, Usuario } from 'src/usuarios/entities/usuario.entity';
import { jwtDecodeUser } from 'src/auth/jwt.strategy';
import { Meta } from './entities/meta.entity';
import { SubMeta } from './sub_meta/entities/sub_meta.entity';
import { MarcoMeta } from './marco_meta/entities/marco_meta.entity';

@Injectable()
export class MetaService {

  constructor(
    private readonly entityManager: EntityManager,
    private readonly jwtService: JwtService,
  ) { }

  async create(access_token: string, createMetaDto: CreateMetaDto) {
    const usuario: Usuario = await this.getUserFromtoken(access_token)

    const meta = await this.entityManager.insert(
      Meta,
      {
        ...createMetaDto,
        // valorAtual: 0,
        usuario
      }
    )

    if (meta.identifiers.length === 0) {
      throw new BadRequestException(meta.raw.message ? meta.raw.message : 'Erro ao criar meta');
    }
    // await this.entityManager.save(meta) // -> não precisa mais, pois o insert já salva

    return meta.identifiers[0]
  }

  async findAll(access_token: string, orderby?: Metasorderby, order: 'ASC' | 'DESC' = 'ASC', search?: string) {
    const usuario: Usuario = await this.getUserFromtoken(access_token)

    return usuario.getMetas(order, orderby, search);
  }

  async findOne(access_token: string, id: string) {
    const usuario: Usuario = await this.getUserFromtoken(access_token)

    const meta = usuario.metas.find(meta => meta.id === id)

    if (!meta) {
      throw new NotFoundException('Meta não encontrada'); // 404
    }
    meta.atualizarProgresso();
    return meta
  }

  async update(access_token: string, id: string, updateMetaDto: UpdateMetaDto) {
    const usuario: Usuario = await this.getUserFromtoken(access_token)

    const meta = usuario.metas.find(meta => meta.id === id)

    if (!meta) {
      throw new NotFoundException('Meta não encontrada'); // 404
    }

    if (Object.keys(updateMetaDto).filter(key => updateMetaDto[key] == meta[key]).length === Object.keys(updateMetaDto).length) {
      throw new BadRequestException('Nenhuma alteração foi feita'); // 400
    }

    if (updateMetaDto.valorAtual && updateMetaDto.valorAtual < 0) {
      throw new BadRequestException('O valor atual deve ser maior que 0'); // 400
    }

    if (updateMetaDto.valor && updateMetaDto.valor < 0) {
      throw new BadRequestException('O valor deve ser maior que 0'); // 400
    }

    if ((updateMetaDto.valorAtual && updateMetaDto.valor && updateMetaDto.valorAtual > updateMetaDto.valor)
      || (updateMetaDto.valorAtual && updateMetaDto.valorAtual > meta.valor)
    ) {
      throw new BadRequestException('O valor atual deve ser menor que o valor'); // 400
    }

    const { submeta, marcos, ...restante } = updateMetaDto

    const result = await this.entityManager.update(
      Meta,
      {
        id
      },
      restante
    )

    if (!result || result.affected === 0) {
      throw new BadRequestException('Nenhuma alteração foi feita'); // 400
    }

    if (submeta) {
      submeta.forEach(async (submeta) => {
        await this.entityManager.update(
          SubMeta,
          {
            id: submeta.id
          },
          submeta
        )
      }
      )
    }

    if (marcos) {
      marcos.forEach(async (marco) => {
        await this.entityManager.update(
          MarcoMeta,
          {
            id: marco.id
          },
          marco
        )
      }
      )
    }

    return result
  }

  async remove(access_token: string, id: string) {
    const usuario: Usuario = await this.getUserFromtoken(access_token)

    const meta = usuario.metas.find(meta => meta.id === id)

    if (!meta) {
      throw new NotFoundException('Meta não encontrada'); // 404
    }

    return this.entityManager.remove(meta)
  }

  async AdicionarValor(access_token: string, id: string, valor: number) {
    const usuario: Usuario = await this.getUserFromtoken(access_token)

    const meta = usuario.metas.find(meta => meta.id === id)

    if (!meta) {
      throw new NotFoundException('Meta não encontrada'); // 404
    }

    if (valor <= 0) {
      throw new BadRequestException('O valor deve ser maior que 0'); // 400
    }

    const result = await this.entityManager.update(
      Meta,
      {
        id
      },
      {
        valorAtual: valor,
        concluida: valor >= Number(meta.valor)
      }
    )

    if (!result || result.affected === 0) {
      throw new BadRequestException('Nenhuma alteração foi feita'); // 400
    }
    meta.valorAtual = valor
    meta.atualizarProgresso();
    return meta
  }

  private getUserFromtoken(token: string): Promise<Usuario> {
    const data = this.jwtService.decode(token) as jwtDecodeUser

    const usuario = this.entityManager.findOne(
      Usuario,
      {
        where: {
          id: data.id
        },
        relations: ['metas', 'metas.subMetas', 'metas.marcos']
      })

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado'); // 404
    }

    return usuario
  }
}
