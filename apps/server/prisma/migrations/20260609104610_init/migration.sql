-- CreateTable
CREATE TABLE "sys_user" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "nickname" VARCHAR(50),
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "avatar" VARCHAR(255),
    "deptId" INTEGER,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "sys_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_refresh_token" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sys_refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200),
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "sys_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_user_role" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "sys_user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_menu" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "path" VARCHAR(200),
    "component" VARCHAR(200),
    "icon" VARCHAR(50),
    "permission" VARCHAR(100),
    "parentId" INTEGER,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "isCache" BOOLEAN NOT NULL DEFAULT true,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "sys_menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_role_menu" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "menuId" INTEGER NOT NULL,

    CONSTRAINT "sys_role_menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_dept" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50),
    "parentId" INTEGER,
    "leader" VARCHAR(50),
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "sys_dept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_dict_type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "sys_dict_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_dict_item" (
    "id" SERIAL NOT NULL,
    "dictTypeId" INTEGER NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "value" VARCHAR(50) NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "sys_dict_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sys_user_username_key" ON "sys_user"("username");

-- CreateIndex
CREATE INDEX "sys_user_deptId_idx" ON "sys_user"("deptId");

-- CreateIndex
CREATE INDEX "sys_user_status_idx" ON "sys_user"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sys_refresh_token_token_key" ON "sys_refresh_token"("token");

-- CreateIndex
CREATE INDEX "sys_refresh_token_userId_idx" ON "sys_refresh_token"("userId");

-- CreateIndex
CREATE INDEX "sys_refresh_token_token_idx" ON "sys_refresh_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sys_role_code_key" ON "sys_role"("code");

-- CreateIndex
CREATE INDEX "sys_role_status_idx" ON "sys_role"("status");

-- CreateIndex
CREATE INDEX "sys_user_role_userId_idx" ON "sys_user_role"("userId");

-- CreateIndex
CREATE INDEX "sys_user_role_roleId_idx" ON "sys_user_role"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "sys_user_role_userId_roleId_key" ON "sys_user_role"("userId", "roleId");

-- CreateIndex
CREATE INDEX "sys_menu_parentId_idx" ON "sys_menu"("parentId");

-- CreateIndex
CREATE INDEX "sys_menu_status_idx" ON "sys_menu"("status");

-- CreateIndex
CREATE INDEX "sys_menu_type_idx" ON "sys_menu"("type");

-- CreateIndex
CREATE INDEX "sys_role_menu_roleId_idx" ON "sys_role_menu"("roleId");

-- CreateIndex
CREATE INDEX "sys_role_menu_menuId_idx" ON "sys_role_menu"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "sys_role_menu_roleId_menuId_key" ON "sys_role_menu"("roleId", "menuId");

-- CreateIndex
CREATE UNIQUE INDEX "sys_dept_code_key" ON "sys_dept"("code");

-- CreateIndex
CREATE INDEX "sys_dept_parentId_idx" ON "sys_dept"("parentId");

-- CreateIndex
CREATE INDEX "sys_dept_status_idx" ON "sys_dept"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sys_dict_type_code_key" ON "sys_dict_type"("code");

-- CreateIndex
CREATE INDEX "sys_dict_type_status_idx" ON "sys_dict_type"("status");

-- CreateIndex
CREATE INDEX "sys_dict_item_dictTypeId_idx" ON "sys_dict_item"("dictTypeId");

-- CreateIndex
CREATE INDEX "sys_dict_item_status_idx" ON "sys_dict_item"("status");

-- AddForeignKey
ALTER TABLE "sys_user" ADD CONSTRAINT "sys_user_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "sys_dept"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_refresh_token" ADD CONSTRAINT "sys_refresh_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "sys_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_user_role" ADD CONSTRAINT "sys_user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "sys_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_user_role" ADD CONSTRAINT "sys_user_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "sys_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_menu" ADD CONSTRAINT "sys_menu_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "sys_menu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_role_menu" ADD CONSTRAINT "sys_role_menu_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "sys_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_role_menu" ADD CONSTRAINT "sys_role_menu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "sys_menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_dept" ADD CONSTRAINT "sys_dept_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "sys_dept"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_dict_item" ADD CONSTRAINT "sys_dict_item_dictTypeId_fkey" FOREIGN KEY ("dictTypeId") REFERENCES "sys_dict_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;
