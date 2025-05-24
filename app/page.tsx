"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Terminal,
  Play,
  RotateCcw,
  Zap,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Download,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"

interface LinhaTerminal {
  id: string
  texto: string
  tipo: "entrada" | "saida" | "sucesso" | "erro" | "info" | "aviso"
  timestamp: Date
  animado?: boolean
}

interface MetricaSistema {
  label: string
  valor: number
  maximo: number
  cor: string
  icone: React.ReactNode
}

export default function TerminalAsyncInterativo() {
  const [linhasTerminal, setLinhasTerminal] = useState<LinhaTerminal[]>([])
  const [entradaAtual, setEntradaAtual] = useState("")
  const [processando, setProcessando] = useState(false)
  const [metricas, setMetricas] = useState<MetricaSistema[]>([
    { label: "CPU", valor: 15, maximo: 100, cor: "bg-blue-500", icone: <Cpu className="w-4 h-4" /> },
    { label: "Memória", valor: 32, maximo: 100, cor: "bg-green-500", icone: <HardDrive className="w-4 h-4" /> },
    { label: "Rede", valor: 8, maximo: 100, cor: "bg-purple-500", icone: <Wifi className="w-4 h-4" /> },
    { label: "Ops Async", valor: 0, maximo: 10, cor: "bg-orange-500", icone: <Activity className="w-4 h-4" /> },
  ])

  const [operacoesAtivas, setOperacoesAtivas] = useState<string[]>([])
  const [opsConcluidas, setOpsConcluidas] = useState(0)
  const [opsFalharam, setOpsFalharam] = useState(0)
  const [tempoTotal, setTempoTotal] = useState(0)

  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll do terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [linhasTerminal])

  // Animação das métricas do sistema
  useEffect(() => {
    const intervalo = setInterval(() => {
      setMetricas((prev) =>
        prev.map((metrica) => ({
          ...metrica,
          valor: Math.max(0, metrica.valor + (Math.random() - 0.5) * 10),
        })),
      )
      setTempoTotal((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(intervalo)
  }, [])

  const adicionarLinhaTerminal = (texto: string, tipo: LinhaTerminal["tipo"] = "saida", animado = true) => {
    const novaLinha: LinhaTerminal = {
      id: Math.random().toString(36).substr(2, 9),
      texto,
      tipo,
      timestamp: new Date(),
      animado,
    }
    setLinhasTerminal((prev) => [...prev, novaLinha])
  }

  const atualizarMetrica = (label: string, valor: number) => {
    setMetricas((prev) =>
      prev.map((metrica) =>
        metrica.label === label ? { ...metrica, valor: Math.min(metrica.maximo, valor) } : metrica,
      ),
    )
  }

  const simularOperacaoAsync = async (nome: string, duracao: number, taxaSucesso = 0.8) => {
    const opId = Math.random().toString(36).substr(2, 9)
    setOperacoesAtivas((prev) => [...prev, opId])
    atualizarMetrica("Ops Async", operacoesAtivas.length + 1)

    adicionarLinhaTerminal(`🚀 Iniciando ${nome}...`, "info")

    // Simular progresso
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, duracao / 10))
      if (i % 30 === 0) {
        adicionarLinhaTerminal(`⏳ ${nome} progresso: ${i}%`, "info")
      }
    }

    setOperacoesAtivas((prev) => prev.filter((id) => id !== opId))
    atualizarMetrica("Ops Async", Math.max(0, operacoesAtivas.length - 1))

    const sucesso = Math.random() < taxaSucesso
    if (sucesso) {
      adicionarLinhaTerminal(`✅ ${nome} concluído com sucesso!`, "sucesso")
      setOpsConcluidas((prev) => prev + 1)
    } else {
      adicionarLinhaTerminal(`❌ ${nome} falhou!`, "erro")
      setOpsFalharam((prev) => prev + 1)
    }

    return sucesso
  }

  const executarComando = async (comando: string) => {
    if (processando) return

    setProcessando(true)
    adicionarLinhaTerminal(`$ ${comando}`, "entrada")

    const cmd = comando.toLowerCase().trim()

    try {
      switch (cmd) {
        case "servidor":
          atualizarMetrica("CPU", 60)
          atualizarMetrica("Rede", 80)
          await simularOperacaoAsync("Requisição ao Servidor", 2000, 0.9)
          atualizarMetrica("CPU", 20)
          atualizarMetrica("Rede", 10)
          break

        case "idade 25":
        case "idade 17":
          const idade = Number.parseInt(cmd.split(" ")[1])
          atualizarMetrica("CPU", 30)
          adicionarLinhaTerminal(`🔍 Validando idade: ${idade}...`, "info")
          await new Promise((resolve) => setTimeout(resolve, 1000))
          if (idade >= 18) {
            adicionarLinhaTerminal(`🔓 Acesso liberado para idade ${idade}`, "sucesso")
          } else {
            adicionarLinhaTerminal(`🚫 Acesso negado para idade ${idade}`, "erro")
          }
          atualizarMetrica("CPU", 15)
          break

        case "download":
          atualizarMetrica("Rede", 90)
          atualizarMetrica("Memória", 70)
          const [resultadoImg, resultadoVideo] = await Promise.all([
            simularOperacaoAsync("Download da Imagem", 2000, 0.95),
            simularOperacaoAsync("Download do Vídeo", 3000, 0.85),
          ])
          adicionarLinhaTerminal(
            `📊 Downloads concluídos: ${resultadoImg && resultadoVideo ? "Todos bem-sucedidos" : "Alguns falharam"}`,
            resultadoImg && resultadoVideo ? "sucesso" : "aviso",
          )
          atualizarMetrica("Rede", 15)
          atualizarMetrica("Memória", 35)
          break

        case "login admin 1234":
        case "login usuario errado":
          const [, usuario, senha] = cmd.split(" ")
          atualizarMetrica("CPU", 40)
          adicionarLinhaTerminal(`🔐 Autenticando ${usuario}...`, "info")
          await new Promise((resolve) => setTimeout(resolve, 1500))
          if (usuario === "admin" && senha === "1234") {
            adicionarLinhaTerminal(`✅ Login bem-sucedido para ${usuario}`, "sucesso")
          } else {
            adicionarLinhaTerminal(`❌ Credenciais inválidas para ${usuario}`, "erro")
          }
          atualizarMetrica("CPU", 15)
          break

        case "usuario":
          atualizarMetrica("CPU", 50)
          atualizarMetrica("Memória", 60)
          adicionarLinhaTerminal(`👤 Buscando dados do usuário...`, "info")
          await new Promise((resolve) => setTimeout(resolve, 1000))
          adicionarLinhaTerminal(`📋 Usuário: Will (ID: 5)`, "sucesso")
          adicionarLinhaTerminal(`🛍️ Buscando pedidos...`, "info")
          await new Promise((resolve) => setTimeout(resolve, 1500))
          adicionarLinhaTerminal(`📦 Pedido 101: Camiseta`, "sucesso")
          adicionarLinhaTerminal(`📦 Pedido 102: Tênis`, "sucesso")
          atualizarMetrica("CPU", 15)
          atualizarMetrica("Memória", 35)
          break

        case "contar 5":
        case "contar 3":
          const contador = Number.parseInt(cmd.split(" ")[1]) || 5
          atualizarMetrica("CPU", 25)
          for (let i = 1; i <= contador; i++) {
            adicionarLinhaTerminal(`📢 Contagem: ${i}`, "info")
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
          adicionarLinhaTerminal(`🎯 Contagem finalizada!`, "sucesso")
          atualizarMetrica("CPU", 15)
          break

        case "corrida":
          atualizarMetrica("CPU", 70)
          atualizarMetrica("Rede", 60)
          adicionarLinhaTerminal(`🏁 Iniciando Promise.race...`, "info")
          const promisesCorrida = [
            new Promise((resolve) => setTimeout(() => resolve("Dados encontrados"), 2000)),
            new Promise((_, reject) => setTimeout(() => reject("Tempo esgotado"), 1000)),
          ]
          try {
            const resultado = await Promise.race(promisesCorrida)
            adicionarLinhaTerminal(`🏆 Vencedor da corrida: ${resultado}`, "sucesso")
          } catch (error) {
            adicionarLinhaTerminal(`⏰ Resultado da corrida: ${error}`, "erro")
          }
          atualizarMetrica("CPU", 15)
          atualizarMetrica("Rede", 10)
          break

        case "todas":
          atualizarMetrica("CPU", 80)
          adicionarLinhaTerminal(`🔄 Executando Promise.allSettled...`, "info")
          const promises = [
            new Promise((resolve) => setTimeout(() => resolve("Sucesso 1s"), 1000)),
            new Promise((_, reject) => setTimeout(() => reject("Erro 2s"), 2000)),
            new Promise((resolve) => setTimeout(() => resolve("Sucesso 0.5s"), 500)),
          ]
          const resultados = await Promise.allSettled(promises)
          resultados.forEach((resultado, index) => {
            if (resultado.status === "fulfilled") {
              adicionarLinhaTerminal(`✅ Promise ${index + 1}: ${resultado.value}`, "sucesso")
            } else {
              adicionarLinhaTerminal(`❌ Promise ${index + 1}: ${resultado.reason}`, "erro")
            }
          })
          atualizarMetrica("CPU", 15)
          break

        case "ajuda":
          adicionarLinhaTerminal(`Comandos disponíveis:`, "info")
          adicionarLinhaTerminal(`• servidor - Testar requisição ao servidor`, "info")
          adicionarLinhaTerminal(`• idade [número] - Validar idade`, "info")
          adicionarLinhaTerminal(`• download - Baixar arquivos`, "info")
          adicionarLinhaTerminal(`• login [usuário] [senha] - Tentativa de login`, "info")
          adicionarLinhaTerminal(`• usuario - Buscar dados do usuário`, "info")
          adicionarLinhaTerminal(`• contar [número] - Contar com delay`, "info")
          adicionarLinhaTerminal(`• corrida - Demo Promise race`, "info")
          adicionarLinhaTerminal(`• todas - Demo Promise.allSettled`, "info")
          adicionarLinhaTerminal(`• limpar - Limpar terminal`, "info")
          break

        case "limpar":
          setLinhasTerminal([])
          break

        default:
          adicionarLinhaTerminal(
            `❓ Comando desconhecido: ${comando}. Digite 'ajuda' para ver os comandos disponíveis.`,
            "erro",
          )
      }
    } catch (error) {
      adicionarLinhaTerminal(`💥 Erro ao executar comando: ${error}`, "erro")
    }

    setProcessando(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (entradaAtual.trim() && !processando) {
      executarComando(entradaAtual.trim())
      setEntradaAtual("")
    }
  }

  const comandosRapidos = [
    { label: "Teste Servidor", cmd: "servidor", icone: <Zap className="w-4 h-4" /> },
    { label: "Verificar Idade", cmd: "idade 25", icone: <Shield className="w-4 h-4" /> },
    { label: "Download", cmd: "download", icone: <Download className="w-4 h-4" /> },
    { label: "Login", cmd: "login admin 1234", icone: <User className="w-4 h-4" /> },
    { label: "Contar", cmd: "contar 5", icone: <Clock className="w-4 h-4" /> },
    { label: "Corrida", cmd: "corrida", icone: <Activity className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 overflow-hidden">
      {/* Efeito de fundo tipo Matrix */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-black"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-4">
        {/* Cabeçalho */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-4xl font-bold text-green-300 glitch-effect">TERMINAL DE OPERAÇÕES ASYNC</h1>
          <p className="text-green-500">Demonstração Interativa de JavaScript Async/Await</p>
          <div className="flex justify-center items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>SISTEMA ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                TEMPO ATIVO: {Math.floor(tempoTotal / 60)}:{(tempoTotal % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* Métricas do Sistema */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metricas.map((metrica) => (
            <Card key={metrica.label} className="bg-gray-900/50 border-green-500/30 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-green-300">
                    {metrica.icone}
                    <span className="text-sm font-semibold">{metrica.label}</span>
                  </div>
                  <span className="text-xs text-green-400">{Math.round(metrica.valor)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${metrica.cor}`}
                    style={{ width: `${(metrica.valor / metrica.maximo) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terminal */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/80 border-green-500/50 backdrop-blur h-96">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-3 border-b border-green-500/30">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-semibold">TERMINAL ASYNC</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                <div ref={terminalRef} className="h-64 overflow-y-auto p-4 space-y-1 text-sm">
                  {linhasTerminal.length === 0 && (
                    <div className="text-green-500/70">
                      <p>Bem-vindo ao Terminal de Operações Async v2.0</p>
                      <p>Digite 'ajuda' para ver os comandos disponíveis ou use os botões rápidos abaixo.</p>
                      <p className="mt-2 text-green-400">Pronto para entrada...</p>
                    </div>
                  )}

                  {linhasTerminal.map((linha) => (
                    <div
                      key={linha.id}
                      className={`flex items-start gap-2 ${
                        linha.tipo === "entrada"
                          ? "text-green-300"
                          : linha.tipo === "sucesso"
                            ? "text-green-400"
                            : linha.tipo === "erro"
                              ? "text-red-400"
                              : linha.tipo === "aviso"
                                ? "text-yellow-400"
                                : linha.tipo === "info"
                                  ? "text-blue-400"
                                  : "text-green-500"
                      } ${linha.animado ? "animate-pulse" : ""}`}
                    >
                      <span className="text-xs text-gray-500 mt-0.5">{linha.timestamp.toLocaleTimeString()}</span>
                      <span className="flex-1">{linha.texto}</span>
                    </div>
                  ))}

                  {processando && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando...</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t border-green-500/30">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <Input
                      ref={inputRef}
                      value={entradaAtual}
                      onChange={(e) => setEntradaAtual(e.target.value)}
                      placeholder="Digite um comando..."
                      className="bg-transparent border-none text-green-400 placeholder-green-600 focus:ring-0 focus:outline-none"
                      disabled={processando}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={processando || !entradaAtual.trim()}
                      className="bg-green-600 hover:bg-green-700 text-black"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Controle */}
          <div className="space-y-4">
            {/* Comandos Rápidos */}
            <Card className="bg-gray-900/80 border-green-500/50 backdrop-blur">
              <CardContent className="p-4">
                <h3 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Comandos Rápidos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {comandosRapidos.map((cmd) => (
                    <Button
                      key={cmd.cmd}
                      onClick={() => executarComando(cmd.cmd)}
                      disabled={processando}
                      variant="outline"
                      size="sm"
                      className="bg-gray-800/50 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300 text-xs"
                    >
                      {cmd.icone}
                      {cmd.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className="bg-gray-900/80 border-green-500/50 backdrop-blur">
              <CardContent className="p-4">
                <h3 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Estatísticas de Operações
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-500 text-sm">Concluídas</span>
                    <Badge variant="outline" className="border-green-500 text-green-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {opsConcluidas}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-500 text-sm">Falharam</span>
                    <Badge variant="outline" className="border-red-500 text-red-400">
                      <XCircle className="w-3 h-3 mr-1" />
                      {opsFalharam}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-500 text-sm">Ativas</span>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      {operacoesAtivas.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações do Sistema */}
            <Card className="bg-gray-900/80 border-green-500/50 backdrop-blur">
              <CardContent className="p-4">
                <h3 className="text-green-300 font-semibold mb-3">Sistema</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => executarComando("limpar")}
                    variant="outline"
                    size="sm"
                    className="w-full bg-gray-800/50 border-green-500/30 text-green-400 hover:bg-green-500/20"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpar Terminal
                  </Button>
                  <Button
                    onClick={() => executarComando("ajuda")}
                    variant="outline"
                    size="sm"
                    className="w-full bg-gray-800/50 border-green-500/30 text-green-400 hover:bg-green-500/20"
                  >
                    <Terminal className="w-4 h-4 mr-2" />
                    Mostrar Ajuda
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glitch-effect {
          animation: glitch 2s infinite;
        }
        
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
      `}</style>
    </div>
  )
}
