import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function clearData() {
  console.log('🧹 清理现有数据...');
  await prisma.refreshToken.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.roleMenu.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.dept.deleteMany({});
  await prisma.dictItem.deleteMany({});
  await prisma.dictType.deleteMany({});
  console.log('✅ 数据清理完成');
}

async function main() {
  console.log('🌱 开始初始化数据库...');
  
  await clearData();

  // 1. 创建部门
  const dept = await prisma.dept.create({
    data: {
      name: '技术部',
      code: 'tech',
      leader: '管理员',
      sort: 1,
      status: 1,
    },
  });
  console.log('✅ 部门创建:', dept.name);

  // 2. 创建菜单
  const menus = [
    // 系统管理目录
    { name: '系统管理', type: 'DIR', path: '/system', icon: 'Setting', sort: 1, status: 1 },
    // 用户管理
    { name: '用户管理', type: 'MENU', path: '/system/user', component: 'system/user/UserView', icon: 'User', permission: 'user:list', sort: 1, parentId: 1 },
    { name: '新增用户', type: 'BUTTON', permission: 'user:create', sort: 1, parentId: 2 },
    { name: '编辑用户', type: 'BUTTON', permission: 'user:update', sort: 2, parentId: 2 },
    { name: '删除用户', type: 'BUTTON', permission: 'user:delete', sort: 3, parentId: 2 },
    // 角色管理
    { name: '角色管理', type: 'MENU', path: '/system/role', component: 'system/role/RoleView', icon: 'UserFilled', permission: 'role:list', sort: 2, parentId: 1 },
    { name: '新增角色', type: 'BUTTON', permission: 'role:create', sort: 1, parentId: 6 },
    { name: '编辑角色', type: 'BUTTON', permission: 'role:update', sort: 2, parentId: 6 },
    { name: '删除角色', type: 'BUTTON', permission: 'role:delete', sort: 3, parentId: 6 },
    // 菜单管理
    { name: '菜单管理', type: 'MENU', path: '/system/menu', component: 'system/menu/MenuView', icon: 'Menu', permission: 'menu:list', sort: 3, parentId: 1 },
    // 部门管理
    { name: '部门管理', type: 'MENU', path: '/system/dept', component: 'system/dept/DeptView', icon: 'OfficeBuilding', permission: 'dept:list', sort: 4, parentId: 1 },
    // 字典管理
    { name: '字典管理', type: 'MENU', path: '/system/dict', component: 'system/dict/DictView', icon: 'Collection', permission: 'dict:list', sort: 5, parentId: 1 },
  ];

  // 先创建目录和菜单（不使用 parentId），再创建按钮
  const createdMenus: any[] = [];
  for (const menu of menus) {
    const created = await prisma.menu.create({
      data: {
        ...menu,
        parentId: menu.parentId ? createdMenus[menu.parentId - 1].id : null,
      },
    });
    createdMenus.push(created);
    console.log('✅ 菜单创建:', created.name);
  }

  // 3. 创建角色
  const role = await prisma.role.create({
    data: {
      name: '超级管理员',
      code: 'super_admin',
      description: '系统最高权限，拥有所有菜单和操作权限',
      sort: 1,
      status: 1,
    },
  });
  console.log('✅ 角色创建:', role.name);

  // 4. 分配所有菜单权限给超级管理员
  const allMenus = await prisma.menu.findMany();
  for (const menu of allMenus) {
    await prisma.roleMenu.create({
      data: {
        roleId: role.id,
        menuId: menu.id,
      },
    });
  }
  console.log('✅ 超级管理员已分配所有权限');

  // 5. 创建超级管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const user = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      nickname: '管理员',
      email: 'admin@sss.com',
      phone: '13800138000',
      deptId: dept.id,
      status: 1,
    },
  });
  console.log('✅ 用户创建:', user.username);

  // 6. 分配角色
  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: role.id,
    },
  });
  console.log('✅ 用户角色分配完成');

  // 7. 创建字典
  const dictTypes = [
    { name: '用户状态', code: 'user_status', items: [
      { label: '禁用', value: '0', sort: 1 },
      { label: '启用', value: '1', sort: 2 },
    ]},
    { name: '菜单类型', code: 'menu_type', items: [
      { label: '目录', value: 'DIR', sort: 1 },
      { label: '菜单', value: 'MENU', sort: 2 },
      { label: '按钮', value: 'BUTTON', sort: 3 },
    ]},
    { name: '性别', code: 'gender', items: [
      { label: '男', value: '1', sort: 1 },
      { label: '女', value: '2', sort: 2 },
      { label: '保密', value: '0', sort: 3 },
    ]},
  ];

  for (const dt of dictTypes) {
    const dictType = await prisma.dictType.create({
      data: {
        name: dt.name,
        code: dt.code,
        status: 1,
      },
    });
    console.log('✅ 字典类型:', dictType.name);

    for (const item of dt.items) {
      await prisma.dictItem.create({
        data: {
          dictTypeId: dictType.id,
          ...item,
          status: 1,
        },
      });
    }
  }
  console.log('✅ 字典数据初始化完成');

  console.log('\n🎉 数据库初始化完成！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  用户名: admin');
  console.log('  密码: admin123');
  console.log('  部门: 技术部');
  console.log('  角色: 超级管理员');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
