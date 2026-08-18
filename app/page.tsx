'use client'

import dynamic from 'next/dynamic'

import {
  useRastreamento,
} from '@/hooks/useRastreamento'


// =====================================================
// MAPA
// =====================================================

const MapaRastreamento = dynamic(
  () =>
    import(
      '@/components/MapaRastreamento'
    ),
  {
    ssr: false,

    loading: () => (
      <div
        className="
          flex
          h-full
          w-full
          items-center
          justify-center
          bg-slate-950
          text-white
        "
      >
        <div className="text-sm">
          Carregando mapa...
        </div>
      </div>
    ),
  }
)


// =====================================================
// PÁGINA
// =====================================================

export default function Home() {

  const {
    objetos,
    areaPermitida,
    mqttOnline,
    enviarSOS,
  } = useRastreamento()


  // ===================================================
  // CONTADORES
  // ===================================================

  const objetosOnline =
    objetos.filter(
      objeto =>
        objeto.online === true
    ).length


  const objetosOffline =
    objetos.filter(
      objeto =>
        objeto.online === false
    ).length


  const objetosSOS =
    objetos.filter(
      objeto =>
        objeto.sos === true
    ).length


  // ===================================================
  // ENVIAR SOS
  // ===================================================
  //
  // IMPORTANTE:
  //
  // NÃO fazer:
  //
  // onClick={enviarSOS}
  //
  // porque o React passaria o evento HTML.
  //
  // Fazemos:
  //
  // onClick={() => enviarSOS(objeto.id)}
  //
  // ===================================================

  const handleSOS = (
    objetoId: string
  ) => {

    console.log(
      'Botão SOS pressionado para:',
      objetoId
    )

    enviarSOS(
      objetoId
    )
  }


  return (
    <main
      className="
        flex
        h-[100dvh]
        w-full
        flex-col
        overflow-hidden
        bg-slate-950
        text-white
      "
    >

      {/* =================================================
          CABEÇALHO
      ================================================= */}

      <header
        className="
          z-[2000]
          flex
          h-14
          shrink-0
          items-center
          justify-between
          border-b
          border-slate-800
          bg-slate-900
          px-3
          sm:h-16
          sm:px-6
        "
      >

        <div className="min-w-0">

          <h1
            className="
              truncate
              text-base
              font-bold
              sm:text-xl
            "
          >
            Sistema de Rastreio
          </h1>

          <p
            className="
              hidden
              text-xs
              text-slate-400
              sm:block
            "
          >
            Monitorização de objetos em tempo real
          </p>

        </div>


        {/* =================================================
            MQTT
        ================================================= */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
          "
        >

          <span
            className={`
              h-2.5
              w-2.5
              rounded-full
              sm:h-3
              sm:w-3
              ${
                mqttOnline
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }
            `}
          />

          <span
            className="
              text-xs
              sm:text-sm
            "
          >
            {mqttOnline
              ? 'Online'
              : 'Offline'}
          </span>

        </div>

      </header>


      {/* =================================================
          ÁREA PRINCIPAL
      ================================================= */}

      <section
        className="
          relative
          min-h-0
          flex-1
        "
      >

        {/* =================================================
            MAPA
        ================================================= */}

        <div
          className="
            absolute
            inset-0
          "
        >

          <MapaRastreamento
            objetos={
              objetos
            }
            areaPermitida={
              areaPermitida
            }
          />

        </div>


        {/* =================================================
            PAINEL
        ================================================= */}

        <aside
          className="
            absolute
            z-[1000]

            bottom-2
            left-2
            right-2

            max-h-[55vh]

            overflow-hidden

            rounded-2xl

            border
            border-slate-700

            bg-slate-900/95

            shadow-2xl

            backdrop-blur

            sm:bottom-auto
            sm:left-4
            sm:right-auto
            sm:top-4

            sm:w-80

            sm:max-h-[calc(100vh-7rem)]

            sm:rounded-xl
          "
        >

          {/* =================================================
              CABEÇALHO DO PAINEL
          ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-800
              px-3
              py-3
              sm:px-4
            "
          >

            <div>

              <h2
                className="
                  text-sm
                  font-semibold
                  sm:text-lg
                "
              >
                Objetos rastreados
              </h2>

              <p
                className="
                  text-[10px]
                  text-slate-500
                  sm:text-xs
                "
              >
                GPS em tempo real
              </p>

            </div>


            <div
              className="
                rounded-full
                bg-slate-800
                px-2
                py-1
                text-[10px]
                text-slate-300
              "
            >
              {objetos.length}
            </div>

          </div>


          {/* =================================================
              CONTEÚDO
          ================================================= */}

          <div
            className="
              max-h-[calc(55vh-60px)]
              overflow-y-auto
              p-2
              sm:max-h-[calc(100vh-15rem)]
              sm:p-3
            "
          >

            {/* =================================================
                ESTATÍSTICAS
            ================================================= */}

            <div
              className="
                mb-3
                grid
                grid-cols-4
                gap-2
              "
            >

              {/* TOTAL */}

              <div
                className="
                  rounded-lg
                  bg-slate-800
                  p-2
                "
              >

                <div
                  className="
                    text-[9px]
                    text-slate-400
                  "
                >
                  Total
                </div>

                <div
                  className="
                    text-lg
                    font-bold
                  "
                >
                  {objetos.length}
                </div>

              </div>


              {/* ONLINE */}

              <div
                className="
                  rounded-lg
                  bg-slate-800
                  p-2
                "
              >

                <div
                  className="
                    text-[9px]
                    text-slate-400
                  "
                >
                  Online
                </div>

                <div
                  className="
                    text-lg
                    font-bold
                    text-green-400
                  "
                >
                  {objetosOnline}
                </div>

              </div>


              {/* OFFLINE */}

              <div
                className="
                  rounded-lg
                  bg-slate-800
                  p-2
                "
              >

                <div
                  className="
                    text-[9px]
                    text-slate-400
                  "
                >
                  Offline
                </div>

                <div
                  className="
                    text-lg
                    font-bold
                    text-red-400
                  "
                >
                  {objetosOffline}
                </div>

              </div>


              {/* SOS */}

              <div
                className={`
                  rounded-lg
                  p-2
                  ${
                    objetosSOS > 0
                      ? 'bg-red-600'
                      : 'bg-slate-800'
                  }
                `}
              >

                <div
                  className="
                    text-[9px]
                    text-slate-200
                  "
                >
                  SOS
                </div>

                <div
                  className="
                    text-lg
                    font-bold
                  "
                >
                  {objetosSOS}
                </div>

              </div>

            </div>


            {/* =================================================
                ALERTA SOS
            ================================================= */}

            {objetosSOS > 0 && (

              <div
                className="
                  mb-3
                  animate-pulse
                  rounded-xl
                  border
                  border-red-500
                  bg-red-950
                  p-3
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    font-bold
                    text-red-400
                  "
                >

                  <span className="text-xl">
                    🚨
                  </span>

                  EMERGÊNCIA SOS

                </div>


                <div
                  className="
                    mt-1
                    text-xs
                    text-red-200
                  "
                >

                  {objetosSOS === 1
                    ? 'Um objeto enviou um alerta SOS.'
                    : `${objetosSOS} objetos enviaram alertas SOS.`}

                </div>

              </div>

            )}


            {/* =================================================
                NENHUM OBJETO
            ================================================= */}

            {objetos.length === 0 && (

              <div
                className="
                  rounded-xl
                  bg-slate-800
                  p-5
                  text-center
                "
              >

                <div
                  className="
                    mb-2
                    text-2xl
                  "
                >
                  📡
                </div>

                <div
                  className="
                    text-sm
                    text-slate-300
                  "
                >
                  Aguardando GPS...
                </div>

                <div
                  className="
                    mt-1
                    text-[10px]
                    text-slate-500
                  "
                >
                  Nenhum objeto conectado
                </div>

              </div>

            )}


            {/* =================================================
                OBJETOS
            ================================================= */}

            <div
              className="
                space-y-2
              "
            >

              {objetos.map(
                objeto => (

                  <div
                    key={
                      objeto.id
                    }
                    className={`
                      rounded-xl
                      border
                      p-3
                      ${
                        objeto.sos
                          ? `
                            border-red-500
                            bg-red-950/80
                          `
                          : `
                            border-slate-700
                            bg-slate-800
                          `
                      }
                    `}
                  >

                    {/* =========================================
                        SOS ATIVO
                    ========================================= */}

                    {objeto.sos && (

                      <div
                        className="
                          mb-3
                          flex
                          items-center
                          gap-2
                          rounded-lg
                          bg-red-600
                          px-3
                          py-2
                          font-bold
                          text-white
                        "
                      >

                        <span
                          className="
                            animate-pulse
                          "
                        >
                          🚨
                        </span>

                        SOS ATIVO

                      </div>

                    )}


                    {/* =========================================
                        NOME / STATUS
                    ========================================= */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-2
                      "
                    >

                      <div
                        className="
                          min-w-0
                        "
                      >

                        <div
                          className="
                            truncate
                            text-sm
                            font-semibold
                          "
                        >
                          {objeto.nome}
                        </div>

                        <div
                          className="
                            text-[9px]
                            text-slate-500
                          "
                        >
                          ID: {objeto.id}
                        </div>

                      </div>


                      <div
                        className="
                          flex
                          shrink-0
                          items-center
                          gap-1.5
                        "
                      >

                        <span
                          className={`
                            h-2
                            w-2
                            rounded-full
                            ${
                              objeto.online
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }
                          `}
                        />

                        <span
                          className="
                            text-[10px]
                            text-slate-400
                          "
                        >
                          {objeto.online
                            ? 'Online'
                            : 'Offline'}
                        </span>

                      </div>

                    </div>


                    {/* =========================================
                        DADOS
                    ========================================= */}

                    <div
                      className="
                        mt-3
                        grid
                        grid-cols-2
                        gap-x-3
                        gap-y-2
                        text-[10px]
                        sm:text-xs
                      "
                    >

                      <div>

                        <span
                          className="
                            text-slate-500
                          "
                        >
                          Velocidade
                        </span>

                        <div>
                          {Number(
                            objeto.velocidade
                          ).toFixed(1)} km/h
                        </div>

                      </div>


                      <div>

                        <span
                          className="
                            text-slate-500
                          "
                        >
                          Bateria
                        </span>

                        <div>
                          {objeto.bateria}%
                        </div>

                      </div>


                      <div>

                        <span
                          className="
                            text-slate-500
                          "
                        >
                          Latitude
                        </span>

                        <div>
                          {Number(
                            objeto.latitude
                          ).toFixed(5)}
                        </div>

                      </div>


                      <div>

                        <span
                          className="
                            text-slate-500
                          "
                        >
                          Longitude
                        </span>

                        <div>
                          {Number(
                            objeto.longitude
                          ).toFixed(5)}
                        </div>

                      </div>


                      <div>

                        <span
                          className="
                            text-slate-500
                          "
                        >
                          Direção
                        </span>

                        <div>
                          {objeto.direcao}°
                        </div>

                      </div>


                      <div>

                        <span
                          className="
                            text-slate-500
                          "
                        >
                          Precisão
                        </span>

                        <div>
                          {objeto.precisao} m
                        </div>

                      </div>

                    </div>


                    {/* =========================================
                        BOTÃO SOS
                    ========================================= */}

                    <button
                      type="button"
                      onClick={() =>
                        handleSOS(
                          objeto.id
                        )
                      }
                      disabled={
                        !mqttOnline
                      }
                      className={`
                        mt-4
                        w-full
                        rounded-lg
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-white
                        transition
                        active:scale-95
                        ${
                          mqttOnline
                            ? `
                              bg-red-600
                              hover:bg-red-700
                            `
                            : `
                              cursor-not-allowed
                              bg-slate-700
                              text-slate-400
                            `
                        }
                      `}
                    >

                      🚨 ENVIAR SOS

                    </button>


                    {/* =========================================
                        ÚLTIMA ATUALIZAÇÃO
                    ========================================= */}

                    <div
                      className="
                        mt-3
                        border-t
                        border-slate-700
                        pt-2
                        text-[9px]
                        text-slate-500
                      "
                    >

                      Última atualização:

                      {' '}

                      <span
                        className="
                          text-slate-300
                        "
                      >
                        {objeto.ultimaAtualizacao}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </aside>

      </section>

    </main>
  )
}