-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mesh" (
    "id" SERIAL NOT NULL,
    "data" TEXT NOT NULL,
    "p0" DOUBLE PRECISION NOT NULL,
    "p1" DOUBLE PRECISION NOT NULL,
    "p2" DOUBLE PRECISION NOT NULL,
    "p3" DOUBLE PRECISION NOT NULL,
    "p4" DOUBLE PRECISION NOT NULL,
    "p5" DOUBLE PRECISION NOT NULL,
    "clusterId" INTEGER NOT NULL,

    CONSTRAINT "Mesh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cluster" (
    "id" SERIAL NOT NULL,
    "rewardValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Mesh" ADD CONSTRAINT "Mesh_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
