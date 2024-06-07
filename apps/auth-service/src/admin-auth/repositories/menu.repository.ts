import { EntityRepository, Repository } from 'typeorm'
import { Menu } from '../entities/menu.entity'

@EntityRepository(Menu)
export class MenuRepository extends Repository<Menu> {
  getManuPermissionByRoleId(roleId: number): Promise<Menu[]> {
    return this.createQueryBuilder('menu')
      .innerJoinAndSelect('menu.subMenus', 'subMenus')
      .innerJoinAndSelect('subMenus.permissions', 'permissions')
      .innerJoin('permissions.roles', 'roles')
      .where('roles.id = :roleId', { roleId })
      .andWhere('menu.referenceId IS NULL')
      .getMany()
  }
}
