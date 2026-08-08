import mqtt, { MqttClient } from 'mqtt'

let client: MqttClient | null = null

export const MQTT_CONFIG = {
  host: 'je1e198f.ala.eu-central-1.emqxsl.com',
  port: 8084,
  protocol: 'wss' as const,

  username: process.env.NEXT_PUBLIC_MQTT_USERNAME || '',
  password: process.env.NEXT_PUBLIC_MQTT_PASSWORD || '',

  topic: 'rastreamento/objetos',
}

export function conectarMQTT(): MqttClient {

  if (client && client.connected) {
    return client
  }

  client = mqtt.connect(
    `wss://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}/mqtt`,
    {
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,

      reconnectPeriod: 3000,

      connectTimeout: 10000,

      clean: true,

      clientId:
        'nextjs-rastreamento-' +
        Math.random().toString(16).substring(2),
    }
  )

  client.on('connect', () => {

    console.log('================================')
    console.log('MQTT CONECTADO')
    console.log('Broker:', MQTT_CONFIG.host)
    console.log('Topic:', MQTT_CONFIG.topic)
    console.log('================================')

    client?.subscribe(
      MQTT_CONFIG.topic,
      { qos: 0 },
      (error) => {

        if (error) {
          console.error(
            'Erro ao subscrever MQTT:',
            error
          )

          return
        }

        console.log(
          'Inscrito em:',
          MQTT_CONFIG.topic
        )
      }
    )
  })

  client.on('reconnect', () => {
    console.log('MQTT reconectando...')
  })

  client.on('error', (error) => {
    console.error(
      'Erro MQTT:',
      error
    )
  })

  client.on('offline', () => {
    console.log('MQTT offline')
  })

  return client
}

export function desconectarMQTT() {

  if (client) {

    client.end(true)

    client = null

    console.log(
      'MQTT desconectado'
    )
  }
}