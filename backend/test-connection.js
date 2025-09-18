const { PrismaClient } = require("@prisma/client");

async function testConnection() {
  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

  try {
    console.log("Testando conexão com o banco de dados...");

    // Teste simples de conexão
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Conexão bem-sucedida!", result);

    // Teste com a tabela tickets
    const ticketCount = await prisma.ticket.count();
    console.log(
      `✅ Tabela tickets acessível! Total de registros: ${ticketCount}`
    );
  } catch (error) {
    console.error("❌ Erro na conexão:", error.message);
    console.error("Detalhes do erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
