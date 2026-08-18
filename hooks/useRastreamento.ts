'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import mqtt, {
  MqttClient,
  IClientOptions,
} from 'mqtt'


// =====================================================
// TIPOS
// =====================================================

export interface ObjetoRastreado {
  id: string
  nome: string

  latitude: number
  longitude: number

  velocidade: number
  direcao: number
  bateria: number
  precisao: number

  limiteNorte: number
  limiteSul: number
  limiteOeste: number
  limiteLeste: number

  dentroDaArea: boolean

  sos: boolean

  timestamp: number

  online: boolean

  ultimaAtualizacao: string
}


// =====================================================
// ÁREA PERMITIDA
// =====================================================

export interface AreaPermitida {
  norte: number
  sul: number
  oeste: number
  leste: number
}


// =====================================================
// CONFIGURAÇÃO MQTT
// =====================================================
//
// Navegador:
// MQTT via WebSocket.
//
// ESP32:
// MQTT TCP na porta 1883.
//
// =====================================================

const MQTT_URL =
  'ws://broker.emqx.io:8083/mqtt'


// =====================================================
// TÓPICO DA TELEMETRIA
// =====================================================

const MQTT_TOPIC_TELEMETRIA =
  'rastreamento/telemetria'


// =====================================================
// TÓPICO DOS COMANDOS
// =====================================================
//
// O navegador envia comandos para o ESP32.
//
// Exemplo:
//
// {
//   "id": "OBJ001",
//   "sos": 1
// }
//
// =====================================================

const MQTT_TOPIC_COMANDO =
  'rastreamento/comando'


// =====================================================
// TEMPO PARA CONSIDERAR OFFLINE
// =====================================================

const TEMPO_OFFLINE =
  8000


// =====================================================
// HOOK
// =====================================================

export function useRastreamento() {

  // ===================================================
  // OBJETOS
  // ===================================================

  const [
    objetos,
    setObjetos,
  ] = useState<ObjetoRastreado[]>([])


  // ===================================================
  // ÁREA
  // ===================================================

  const [
    areaPermitida,
    setAreaPermitida,
  ] = useState<AreaPermitida | null>(null)


  // ===================================================
  // MQTT ONLINE
  // ===================================================

  const [
    mqttOnline,
    setMqttOnline,
  ] = useState(false)


  // ===================================================
  // REFERÊNCIA MQTT
  // ===================================================

  const mqttRef =
    useRef<MqttClient | null>(null)


  // ===================================================
  // CONTROLE DE MONTAGEM
  // ===================================================

  const montadoRef =
    useRef(false)


  // ===================================================
  // ÚLTIMA VEZ QUE CADA OBJETO FOI RECEBIDO
  // ===================================================

  const ultimoRecebimentoRef =
    useRef<Record<string, number>>({})


  // ===================================================
  // CONECTAR MQTT
  // ===================================================

  useEffect(() => {

    montadoRef.current = true


    // =================================================
    // EVITAR CLIENTE DUPLICADO
    // =================================================

    if (mqttRef.current) {

      return

    }


    // =================================================
    // CLIENT ID
    // =================================================

    const clientId =
      `WEB_RASTREIO_${Date.now()}_${Math.random()
        .toString(16)
        .slice(2)}`


    console.log(
      '======================================'
    )

    console.log(
      'INICIANDO MQTT'
    )

    console.log(
      'URL:',
      MQTT_URL
    )

    console.log(
      'TELEMETRIA:',
      MQTT_TOPIC_TELEMETRIA
    )

    console.log(
      'COMANDO:',
      MQTT_TOPIC_COMANDO
    )

    console.log(
      'CLIENT ID:',
      clientId
    )

    console.log(
      '======================================'
    )


    // =================================================
    // OPÇÕES MQTT
    // =================================================

    const options: IClientOptions = {

      clientId,

      clean: true,

      connectTimeout:
        15000,

      reconnectPeriod:
        3000,

      keepalive:
        30,

      protocolVersion:
        4,

      resubscribe:
        true,

    }


    // =================================================
    // CONECTAR
    // =================================================

    const client =
      mqtt.connect(
        MQTT_URL,
        options
      )


    mqttRef.current =
      client


    // =================================================
    // CONNECT
    // =================================================

    client.on(
      'connect',
      () => {

        if (
          !montadoRef.current
        ) {

          return

        }


        console.log(
          'MQTT conectado'
        )


        setMqttOnline(
          true
        )


        // =============================================
        // SUBSCREVER TELEMETRIA
        // =============================================

        client.subscribe(
          MQTT_TOPIC_TELEMETRIA,
          {
            qos: 0,
          },
          error => {

            if (error) {

              console.error(
                'Erro ao subscrever telemetria:',
                error
              )

              return

            }


            console.log(
              'Subscrito:',
              MQTT_TOPIC_TELEMETRIA
            )

          }
        )

      }
    )


    // =================================================
    // MESSAGE
    // =================================================

    client.on(
      'message',
      (
        topic,
        payload
      ) => {

        if (
          !montadoRef.current
        ) {

          return

        }


        // =============================================
        // ACEITAR APENAS TELEMETRIA
        // =============================================

        if (
          topic !==
          MQTT_TOPIC_TELEMETRIA
        ) {

          return

        }


        // =============================================
        // PAYLOAD
        // =============================================

        const texto =
          payload.toString()


        console.log(
          'MQTT recebido:',
          texto
        )


        // =============================================
        // JSON
        // =============================================

        let dados: Record<string, unknown>


        try {

          dados =
            JSON.parse(
              texto
            )

        } catch (erro) {

          console.error(
            'JSON MQTT inválido:',
            erro
          )

          return

        }


        // =============================================
        // ID
        // =============================================

        if (
          !dados.id
        ) {

          console.warn(
            'Mensagem sem ID:',
            dados
          )

          return

        }


        const id =
          String(
            dados.id
          )


        // =============================================
        // DADOS NUMÉRICOS
        // =============================================

        const latitude =
          Number(
            dados.latitude
          )


        const longitude =
          Number(
            dados.longitude
          )


        const velocidade =
          Number(
            dados.velocidade
          )


        const direcao =
          Number(
            dados.direcao
          )


        const bateria =
          Number(
            dados.bateria
          )


        const precisao =
          Number(
            dados.precisao
          )


        // =============================================
        // VALIDAR GPS
        // =============================================

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {

          console.warn(
            'Coordenadas inválidas:',
            dados
          )

          return

        }


        // =============================================
        // LIMITES
        // =============================================

        const limiteNorte =
          Number(
            dados.limiteNorte
          )


        const limiteSul =
          Number(
            dados.limiteSul
          )


        const limiteOeste =
          Number(
            dados.limiteOeste
          )


        const limiteLeste =
          Number(
            dados.limiteLeste
          )


        const temArea =
          Number.isFinite(
            limiteNorte
          ) &&
          Number.isFinite(
            limiteSul
          ) &&
          Number.isFinite(
            limiteOeste
          ) &&
          Number.isFinite(
            limiteLeste
          )


        // =============================================
        // DENTRO DA ÁREA
        // =============================================

        let dentroDaArea =
          true


        if (
          temArea
        ) {

          const valorRecebido =
            dados.dentroDaArea


          if (
            typeof valorRecebido ===
            'boolean'
          ) {

            dentroDaArea =
              valorRecebido

          } else {

            dentroDaArea =
              latitude >= limiteSul &&
              latitude <= limiteNorte &&
              longitude >= limiteOeste &&
              longitude <= limiteLeste

          }

        }


        // =============================================
        // ATUALIZAR ÁREA
        // =============================================

        if (
          temArea
        ) {

          setAreaPermitida({

            norte:
              limiteNorte,

            sul:
              limiteSul,

            oeste:
              limiteOeste,

            leste:
              limiteLeste,

          })

        }


        // =============================================
        // SOS
        // =============================================
        //
        // O ESP32 deve enviar:
        //
        // "sos": 1
        //
        // ou:
        //
        // "sos": 0
        //
        // Também aceitamos boolean.
        //
        // =============================================

        const sos =
          dados.sos === true ||
          dados.sos === 1 ||
          dados.sos === '1' ||
          dados.sos === 'true'


        // =============================================
        // MARCAR RECEBIMENTO
        // =============================================
        //
        // IMPORTANTE:
        //
        // Não usamos dados.timestamp para calcular
        // online/offline porque o timestamp do ESP32
        // pode ser millis().
        //
        // Usamos o relógio do navegador.
        //
        // =============================================

        const agora =
          Date.now()


        ultimoRecebimentoRef.current[id] =
          agora


        // =============================================
        // HORA
        // =============================================

        const ultimaAtualizacao =
          new Date(
            agora
          ).toLocaleTimeString(
            'pt-PT'
          )


        // =============================================
        // TIMESTAMP
        // =============================================

        const timestamp =
          Number(
            dados.timestamp
          )


        // =============================================
        // NOVO OBJETO
        // =============================================

        const novoObjeto:
          ObjetoRastreado = {

          id,

          nome:
            dados.nome
              ? String(
                  dados.nome
                )
              : id,


          latitude,

          longitude,


          velocidade:
            Number.isFinite(
              velocidade
            )
              ? velocidade
              : 0,


          direcao:
            Number.isFinite(
              direcao
            )
              ? direcao
              : 0,


          bateria:
            Number.isFinite(
              bateria
            )
              ? bateria
              : 0,


          precisao:
            Number.isFinite(
              precisao
            )
              ? precisao
              : 0,


          limiteNorte:
            temArea
              ? limiteNorte
              : 0,


          limiteSul:
            temArea
              ? limiteSul
              : 0,


          limiteOeste:
            temArea
              ? limiteOeste
              : 0,


          limiteLeste:
            temArea
              ? limiteLeste
              : 0,


          dentroDaArea,


          // =========================================
          // SOS DO ESP32
          // =========================================

          sos,


          // =========================================
          // TIMESTAMP
          // =========================================

          timestamp:
            Number.isFinite(
              timestamp
            )
              ? timestamp
              : 0,


          // =========================================
          // ONLINE
          // =========================================

          online:
            true,


          ultimaAtualizacao,

        }


        // =============================================
        // ATUALIZAR OBJETOS
        // =============================================

        setObjetos(
          listaAnterior => {

            const indice =
              listaAnterior.findIndex(
                objeto =>
                  objeto.id === id
              )


            // =========================================
            // NOVO
            // =========================================

            if (
              indice === -1
            ) {

              return [
                ...listaAnterior,
                novoObjeto,
              ]

            }


            // =========================================
            // EXISTENTE
            // =========================================

            const novaLista =
              [
                ...listaAnterior,
              ]


            novaLista[indice] =
              novoObjeto


            return novaLista

          }
        )

      }
    )


    // =================================================
    // ERROR
    // =================================================

    client.on(
      'error',
      erro => {

        console.error(
          'Erro MQTT:',
          erro
        )

      }
    )


    // =================================================
    // OFFLINE
    // =================================================

    client.on(
      'offline',
      () => {

        console.warn(
          'MQTT offline'
        )


        if (
          montadoRef.current
        ) {

          setMqttOnline(
            false
          )

        }

      }
    )


    // =================================================
    // RECONNECT
    // =================================================

    client.on(
      'reconnect',
      () => {

        console.log(
          'MQTT tentando reconectar...'
        )

      }
    )


    // =================================================
    // CLOSE
    // =================================================

    client.on(
      'close',
      () => {

        console.warn(
          'MQTT fechado'
        )


        if (
          montadoRef.current
        ) {

          setMqttOnline(
            false
          )

        }

      }
    )


    // =================================================
    // CLEANUP
    // =================================================

    return () => {

      montadoRef.current =
        false


      console.log(
        'Encerrando MQTT...'
      )


      if (
        mqttRef.current
      ) {

        mqttRef.current.end(
          true
        )

        mqttRef.current =
          null

      }

    }

  }, [])


  // ===================================================
  // VERIFICAR ONLINE/OFFLINE
  // ===================================================

  useEffect(() => {

    const intervalo =
      window.setInterval(
        () => {

          const agora =
            Date.now()


          setObjetos(
            listaAnterior => {

              let alterou =
                false


              const novaLista =
                listaAnterior.map(
                  objeto => {

                    const ultimoRecebimento =
                      ultimoRecebimentoRef.current[
                        objeto.id
                      ] ?? 0


                    const online =
                      (
                        agora -
                        ultimoRecebimento
                      ) <
                      TEMPO_OFFLINE


                    if (
                      online !==
                      objeto.online
                    ) {

                      alterou =
                        true

                    }


                    return {

                      ...objeto,

                      online,

                    }

                  }
                )


              return alterou
                ? novaLista
                : listaAnterior

            }
          )

        },
        2000
      )


    return () => {

      window.clearInterval(
        intervalo
      )

    }

  }, [])


  // ===================================================
  // ENVIAR SOS
  // ===================================================
  //
  // O BOTÃO VIRTUAL CHAMA:
  //
  // enviarSOS('OBJ001')
  //
  // E O NAVEGADOR ENVIA:
  //
  // {
  //   "id": "OBJ001",
  //   "sos": 1
  // }
  //
  // O ESP32 recebe esse comando.
  //
  // O ESP32 é responsável por gerar:
  //
  // sos = 1
  //
  // e depois:
  //
  // sos = 0
  //
  // Portanto NÃO mantemos um SOS artificial
  // no navegador.
  //
  // ===================================================

  const enviarSOS =
    useCallback(
      (
        objetoId: string
      ): boolean => {

        const client =
          mqttRef.current


        // =============================================
        // VERIFICAR MQTT
        // =============================================

        if (
          !client ||
          !client.connected
        ) {

          console.error(
            'Não é possível enviar SOS: MQTT offline.'
          )

          return false

        }


        // =============================================
        // COMANDO
        // =============================================

        const comando = {

          id:
            objetoId,

          sos:
            1,

        }


        // =============================================
        // JSON
        // =============================================

        const payload =
          JSON.stringify(
            comando
          )


        console.log(
          'ENVIANDO SOS:',
          payload
        )


        // =============================================
        // PUBLICAR
        // =============================================

        client.publish(
          MQTT_TOPIC_COMANDO,
          payload,
          {
            qos: 0,
            retain: false,
          },
          erro => {

            if (
              erro
            ) {

              console.error(
                'Erro ao enviar SOS:',
                erro
              )

              return

            }


            console.log(
              'SOS enviado com sucesso.'
            )

          }
        )


        return true

      },
      []
    )


  // ===================================================
  // RETORNO
  // ===================================================

  return {

    objetos,

    areaPermitida,

    mqttOnline,

    enviarSOS,

  }

}