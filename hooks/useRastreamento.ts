'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import mqtt, {
  MqttClient,
} from 'mqtt';

import type {
  ObjetoRastreado,
  EventLog,
} from '@/types/rastreamento';


// =====================================================
// HOOK DE RASTREAMENTO EM TEMPO REAL
// =====================================================

export function useRastreamento() {

  // ===================================================
  // ESTADO DOS OBJETOS
  // ===================================================

  const [
    objetos,
    setObjetos,
  ] = useState<ObjetoRastreado[]>([]);


  // ===================================================
  // ESTADO DA CONEXÃO MQTT
  // ===================================================

  const [
    mqttOnline,
    setMqttOnline,
  ] = useState(false);


  // ===================================================
  // LOGS DO SISTEMA
  // ===================================================

  const [
    logs,
    setLogs,
  ] = useState<EventLog[]>([]);


  // ===================================================
  // REFERÊNCIA DO CLIENTE MQTT
  // ===================================================

  const clienteMqttRef =
    useRef<MqttClient | null>(null);


  // ===================================================
  // CONFIGURAÇÃO MQTT
  // ===================================================

  const BROKER_URL =
    'wss://broker.emqx.io:8084/mqtt';

  const TOPICO_RASTREAMENTO =
    'rastreamento/telemetria';


  // ===================================================
  // EMITIR LOG
  // ===================================================

  const emitirLog = useCallback(
    (
      type: EventLog['type'],
      message: string
    ) => {

      const novoLog: EventLog = {

        id:
          Math.random()
            .toString(36)
            .substring(2, 9),

        time:
          new Date().toLocaleTimeString(
            'pt-PT',
            {
              hour12: false,
            }
          ),

        type,

        message,
      };


      setLogs(
        atual => [
          novoLog,
          ...atual,
        ].slice(0, 10)
      );

    },
    []
  );


  // ===================================================
  // CONEXÃO MQTT
  // ===================================================

  useEffect(() => {

    emitirLog(
      'info',
      'A conectar ao Broker EMQX...'
    );


    // =================================================
    // CRIAR CLIENTE MQTT
    // =================================================

    const clienteMqtt =
      mqtt.connect(
        BROKER_URL,
        {

          clientId:
            `nextjs_rastreio_${Math.random()
              .toString(16)
              .substring(2, 8)}`,

          clean: true,

          connectTimeout: 4000,

          reconnectPeriod: 1000,

        }
      );


    clienteMqttRef.current =
      clienteMqtt;


    // =================================================
    // MQTT CONECTADO
    // =================================================

    clienteMqtt.on(
      'connect',
      () => {

        setMqttOnline(true);


        emitirLog(
          'success',
          'Ligado ao EMQX via WebSocket.'
        );


        // =============================================
        // SUBSCREVER AO TÓPICO
        // =============================================

        clienteMqtt.subscribe(
          TOPICO_RASTREAMENTO,
          error => {

            if (error) {

              emitirLog(
                'critical',
                `Erro ao subscrever: ${error.message}`
              );

              return;
            }


            emitirLog(
              'success',
              `Subscrito em ${TOPICO_RASTREAMENTO}`
            );

          }
        );

      }
    );


    // =================================================
    // RECEBER MENSAGENS
    // =================================================

    clienteMqtt.on(
      'message',
      (
        topico,
        payload
      ) => {

        // =============================================
        // VERIFICAR TÓPICO
        // =============================================

        if (
          topico !==
          TOPICO_RASTREAMENTO
        ) {
          return;
        }


        try {

          // ===========================================
          // CONVERTER PAYLOAD
          // ===========================================

          const mensagem =
            payload.toString();


          console.log(
            'MQTT recebido:',
            mensagem
          );


          // ===========================================
          // CONVERTER JSON
          // ===========================================

          const dados =
            JSON.parse(
              mensagem
            );


          // ===========================================
          // VALIDAR ID
          // ===========================================

          if (
            !dados.id
          ) {

            emitirLog(
              'warning',
              'Mensagem recebida sem ID.'
            );

            return;
          }


          // ===========================================
          // CONVERTER COORDENADAS
          // ===========================================

          const latitude =
            Number(
              dados.latitude
            );

          const longitude =
            Number(
              dados.longitude
            );


          // ===========================================
          // VALIDAR GPS
          // ===========================================

          if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
          ) {

            emitirLog(
              'warning',
              'Coordenadas GPS inválidas.'
            );

            return;
          }


          // ===========================================
          // TIMESTAMP
          // ===========================================

          const timestamp = Date.now();

          const objetoAtualizado:
            ObjetoRastreado = {

            id:
              String(
                dados.id
              ),

            nome:
              dados.nome
                ? String(
                    dados.nome
                  )
                : `Objeto ${dados.id}`,

            latitude,

            longitude,

            velocidade:
              Number(
                dados.velocidade ?? 0
              ),

            direcao:
              Number(
                dados.direcao ?? 0
              ),

            bateria:
              Number(
                dados.bateria ?? 0
              ),

            precisao:
              Number(
                dados.precisao ?? 0
              ),

            online:
              true,

            ultimaAtualizacao:
              new Date(
                timestamp
              ).toLocaleTimeString(
                'pt-PT',
                {
                  hour12: false,
                }
              ),

            timestamp,

          };


          // =================================================
          // ATUALIZAR OBJETOS
          // =================================================

          setObjetos(
            anteriores => {

              const objetoExiste =
                anteriores.some(
                  objeto =>
                    objeto.id ===
                    objetoAtualizado.id
                );


              // ============================================
              // NOVO OBJETO
              // ============================================

              if (
                !objetoExiste
              ) {

                emitirLog(
                  'success',
                  `${objetoAtualizado.nome} entrou no sistema.`
                );


                return [
                  ...anteriores,
                  objetoAtualizado,
                ];

              }


              // ============================================
              // ATUALIZAR OBJETO EXISTENTE
              // ============================================

              return anteriores.map(
                objeto =>

                  objeto.id ===
                  objetoAtualizado.id

                    ? objetoAtualizado

                    : objeto
              );

            }
          );

        }

        catch (erro) {

          console.error(
            'Erro ao processar MQTT:',
            erro
          );


          emitirLog(
            'critical',
            'Erro ao interpretar os dados recebidos pelo MQTT.'
          );

        }

      }
    );


    // =================================================
    // MQTT OFFLINE
    // =================================================

    clienteMqtt.on(
      'offline',
      () => {

        setMqttOnline(false);


        emitirLog(
          'warning',
          'MQTT offline.'
        );

      }
    );


    // =================================================
    // RECONEXÃO
    // =================================================

    clienteMqtt.on(
      'reconnect',
      () => {

        emitirLog(
          'info',
          'A reconectar ao Broker EMQX...'
        );

      }
    );


    // =================================================
    // ERRO MQTT
    // =================================================

    clienteMqtt.on(
      'error',
      erro => {

        setMqttOnline(false);


        emitirLog(
          'critical',
          `Erro MQTT: ${erro.message}`
        );

      }
    );


    // =================================================
    // LIMPEZA
    // =================================================

    return () => {

      clienteMqtt.end(
        true
      );


      clienteMqttRef.current =
        null;

    };

  }, [emitirLog]);


  // =====================================================
  // VERIFICAR OBJETOS OFFLINE
  // =====================================================

  useEffect(() => {

    const intervalo =
      setInterval(
        () => {

          const agora =
            Date.now();


          setObjetos(
            anteriores =>

              anteriores.map(
                objeto => {

                  const diferenca =
                    agora -
                    objeto.timestamp;


                  return {

                    ...objeto,

                    online:
                      diferenca < 30000,

                  };

                }
              )
          );

        },

        5000
      );


    return () => {

      clearInterval(
        intervalo
      );

    };

  }, []);


  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {

    objetos,

    mqttOnline,

    logs,

  };

}