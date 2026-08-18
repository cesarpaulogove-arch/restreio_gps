'use client'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Rectangle,
  useMap,
} from 'react-leaflet'

import L from 'leaflet'
import { useEffect, useRef } from 'react'

import 'leaflet/dist/leaflet.css'


// =====================================================
// TIPOS
// =====================================================

interface ObjetoRastreado {
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


interface AreaPermitida {
  norte: number
  sul: number
  oeste: number
  leste: number
}


interface Props {
  objetos: ObjetoRastreado[]
  areaPermitida: AreaPermitida | null
}


// =====================================================
// ÍCONE DO OBJETO
// =====================================================

function criarIcone(
  objeto: ObjetoRastreado
) {

  let cor = '#64748b'

  if (objeto.online) {
    cor = '#22c55e'
  }

  if (objeto.sos) {
    cor = '#ef4444'
  }


  return L.divIcon({

    className: '',

    html: `
      <div
        style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${cor};
          border: 3px solid white;
          box-shadow: 0 3px 12px rgba(0,0,0,.45);

          display: flex;
          align-items: center;
          justify-content: center;

          color: white;
          font-size: 18px;
          font-weight: bold;
        "
      >
        ${objeto.sos ? '!' : '●'}
      </div>
    `,

    iconSize: [
      40,
      40,
    ],

    iconAnchor: [
      20,
      20,
    ],

    popupAnchor: [
      0,
      -20,
    ],

  })

}


// =====================================================
// MAPA DINÂMICO
// =====================================================
//
// O mapa acompanha o objeto automaticamente.
//
// IMPORTANTE:
// O zoom atual NÃO é alterado.
// Apenas o centro do mapa acompanha o objeto.
//
// =====================================================

function AcompanharObjeto({
  objetos,
}: {
  objetos: ObjetoRastreado[]
}) {

  const map = useMap()


  const ultimoObjetoRef =
    useRef<{
      id: string
      latitude: number
      longitude: number
    } | null>(null)


  useEffect(() => {

    if (objetos.length === 0) {
      return
    }


    // =================================================
    // ESCOLHER OBJETO
    // =================================================
    //
    // Primeiro procura um objeto online.
    //
    // Se existir SOS, dá prioridade ao SOS.
    //
    // =================================================

    const objetoSOS =
      objetos.find(
        objeto =>
          objeto.sos &&
          objeto.online
      )


    const objetoOnline =
      objetos.find(
        objeto =>
          objeto.online
      )


    const objeto =
      objetoSOS ||
      objetoOnline ||
      objetos[0]


    if (!objeto) {
      return
    }


    // =================================================
    // VERIFICAR SE REALMENTE MUDOU
    // =================================================

    const ultimo =
      ultimoObjetoRef.current


    if (
      ultimo &&
      ultimo.id === objeto.id &&
      ultimo.latitude === objeto.latitude &&
      ultimo.longitude === objeto.longitude
    ) {

      return

    }


    ultimoObjetoRef.current = {

      id:
        objeto.id,

      latitude:
        objeto.latitude,

      longitude:
        objeto.longitude,

    }


    // =================================================
    // MANTER O ZOOM ATUAL
    // =================================================

    const zoomAtual =
      map.getZoom()


    // =================================================
    // NOVA POSIÇÃO
    // =================================================

    const novaPosicao =
      L.latLng(
        objeto.latitude,
        objeto.longitude
      )


    // =================================================
    // ACOMPANHAR OBJETO
    // =================================================

    map.setView(
      novaPosicao,
      zoomAtual,
      {
        animate: true,
      }
    )


  }, [
    objetos,
    map,
  ])


  return null

}


// =====================================================
// ÁREA PERMITIDA
// =====================================================

function AreaMapa({
  areaPermitida,
}: {
  areaPermitida: AreaPermitida | null
}) {

  if (!areaPermitida) {
    return null
  }


  const bounds: [
    [number, number],
    [number, number]
  ] = [

    [
      areaPermitida.sul,
      areaPermitida.oeste,
    ],

    [
      areaPermitida.norte,
      areaPermitida.leste,
    ],

  ]


  return (

    <Rectangle

      bounds={
        bounds
      }

      pathOptions={{

        // =============================================
        // LINHA DA ÁREA
        // =============================================

        color:
          '#22c55e',

        weight:
          6,

        opacity:
          1,

        // =============================================
        // SEM TRACEJADO
        // =============================================

        dashArray:
          undefined,

        // =============================================
        // PREENCHIMENTO
        // =============================================

        fillColor:
          '#22c55e',

        fillOpacity:
          0.05,

      }}

    />

  )

}


// =====================================================
// MAPA
// =====================================================

export default function MapaRastreamento({
  objetos,
  areaPermitida,
}: Props) {


  // ===================================================
  // POSIÇÃO INICIAL
  // ===================================================

  const centroInicial: [
    number,
    number
  ] = [

    -25.965300,

    32.589200,

  ]


  return (

    <div
      className="
        h-full
        w-full
        overflow-hidden
        bg-slate-950
      "
    >

      <MapContainer

        center={
          centroInicial
        }

        zoom={17}

        minZoom={13}

        maxZoom={20}

        scrollWheelZoom={true}

        zoomControl={true}

        className="
          h-full
          w-full
        "

      >

        {/* =================================================
            MAPA
        ================================================= */}

        <TileLayer

          attribution="
            &copy; OpenStreetMap contributors
          "

          url="
            https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
          "

        />


        {/* =================================================
            ACOMPANHAR OBJETO
        ================================================= */}

        <AcompanharObjeto

          objetos={
            objetos
          }

        />


        {/* =================================================
            ÁREA PERMITIDA
        ================================================= */}

        <AreaMapa

          areaPermitida={
            areaPermitida
          }

        />


        {/* =================================================
            OBJETOS
        ================================================= */}

        {objetos.map(
          objeto => (

            <Marker

              key={
                objeto.id
              }

              position={[
                objeto.latitude,
                objeto.longitude,
              ]}

              icon={
                criarIcone(
                  objeto
                )
              }

            >

              <Popup>

                <div
                  className="
                    min-w-[220px]
                    text-sm
                  "
                >

                  {/* =====================================
                      NOME
                  ===================================== */}

                  <div
                    className="
                      mb-1
                      text-base
                      font-bold
                    "
                  >

                    {objeto.nome}

                  </div>


                  {/* =====================================
                      ID
                  ===================================== */}

                  <div
                    className="
                      text-xs
                      text-gray-500
                    "
                  >

                    ID: {objeto.id}

                  </div>


                  {/* =====================================
                      STATUS
                  ===================================== */}

                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background:
                          objeto.online
                            ? '#22c55e'
                            : '#ef4444',
                      }}
                    />

                    {objeto.online
                      ? 'Online'
                      : 'Offline'}

                  </div>


                  {/* =====================================
                      SOS
                  ===================================== */}

                  {objeto.sos && (

                    <div
                      className="
                        mt-3
                        rounded-lg
                        bg-red-600
                        px-3
                        py-2
                        text-center
                        font-bold
                        text-white
                      "
                    >

                      🚨 SOS ATIVO

                    </div>

                  )}


                  {/* =====================================
                      DADOS
                  ===================================== */}

                  <div
                    className="
                      mt-3
                      grid
                      grid-cols-2
                      gap-3
                      text-xs
                    "
                  >

                    <div>

                      <div
                        className="
                          text-gray-500
                        "
                      >
                        Velocidade
                      </div>

                      <strong>

                        {objeto.velocidade.toFixed(1)}
                        {' '}
                        km/h

                      </strong>

                    </div>


                    <div>

                      <div
                        className="
                          text-gray-500
                        "
                      >
                        Bateria
                      </div>

                      <strong>

                        {objeto.bateria.toFixed(0)}%

                      </strong>

                    </div>


                    <div>

                      <div
                        className="
                          text-gray-500
                        "
                      >
                        Latitude
                      </div>

                      <strong>

                        {objeto.latitude.toFixed(6)}

                      </strong>

                    </div>


                    <div>

                      <div
                        className="
                          text-gray-500
                        "
                      >
                        Longitude
                      </div>

                      <strong>

                        {objeto.longitude.toFixed(6)}

                      </strong>

                    </div>


                    <div>

                      <div
                        className="
                          text-gray-500
                        "
                      >
                        Direção
                      </div>

                      <strong>

                        {objeto.direcao.toFixed(0)}°

                      </strong>

                    </div>


                    <div>

                      <div
                        className="
                          text-gray-500
                        "
                      >
                        Precisão
                      </div>

                      <strong>

                        {objeto.precisao.toFixed(1)}
                        {' '}
                        m

                      </strong>

                    </div>

                  </div>


                  {/* =====================================
                      ÁREA
                  ===================================== */}

                  <div
                    className={`
                      mt-3
                      rounded-lg
                      px-3
                      py-2
                      text-center
                      font-semibold

                      ${
                        objeto.dentroDaArea

                          ? 'bg-green-100 text-green-700'

                          : 'bg-red-100 text-red-700'
                      }
                    `}
                  >

                    {objeto.dentroDaArea

                      ? '✓ Dentro da área'

                      : '⚠ Fora da área'

                    }

                  </div>


                  {/* =====================================
                      ATUALIZAÇÃO
                  ===================================== */}

                  <div
                    className="
                      mt-2
                      text-[10px]
                      text-gray-400
                    "
                  >

                    Atualizado:
                    {' '}
                    {objeto.ultimaAtualizacao}

                  </div>

                </div>

              </Popup>

            </Marker>

          )
        )}

      </MapContainer>

    </div>

  )

}