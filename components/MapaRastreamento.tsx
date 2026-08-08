'use client'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from 'react-leaflet'

import L from 'leaflet'

import {
  useEffect,
  useRef,
} from 'react'

import 'leaflet/dist/leaflet.css'

import type {
  ObjetoRastreado,
} from '@/types/rastreamento'



interface Props {
  objetos: ObjetoRastreado[]
}


// =====================================================
// ÍCONE DO OBJETO
// =====================================================

const iconeObjeto = new L.Icon({

  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

  iconSize: [25, 41],

  iconAnchor: [12, 41],

  popupAnchor: [1, -34],

  shadowSize: [41, 41],
})


// =====================================================
// CENTRALIZAR MAPA
// =====================================================

function AtualizadorCamera({
  objetos,
}: {
  objetos: ObjetoRastreado[]
}) {

  const map = useMap()

  const jaCentralizou =
    useRef(false)


  useEffect(() => {

    if (jaCentralizou.current) {
      return
    }

    const ativos =
      objetos.filter(
        objeto => objeto.online
      )


    if (ativos.length === 0) {
      return
    }


    const bounds =
      L.latLngBounds(
        ativos.map(
          objeto => [
            objeto.latitude,
            objeto.longitude,
          ] as [number, number]
        )
      )


    map.fitBounds(
      bounds,
      {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
      }
    )


    jaCentralizou.current = true

  }, [map, objetos])


  return null
}


// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function MapaRastreamento({
  objetos,
}: Props) {


  const centroInicial:
    [number, number] = [
      -25.9653,
      32.5892,
    ]


  return (

    <MapContainer

      center={centroInicial}

      zoom={13}

      scrollWheelZoom={true}

      className="w-full h-full z-0"

    >

      {/* ==============================================
          MAPA
      ============================================== */}

      <TileLayer

        attribution="
          © OpenStreetMap
          © CARTO
        "

        url="
          https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
        "

      />


      {/* ==============================================
          OBJETOS
      ============================================== */}

      {objetos
        .filter(
          objeto =>
            objeto.online
        )
        .map(
          objeto => (

            <Marker

              key={objeto.id}

              position={[
                objeto.latitude,
                objeto.longitude,
              ]}

              icon={iconeObjeto}

            >

              {/* ========================================
                  IDENTIFICAÇÃO
              ======================================== */}

              <Tooltip
                permanent
                direction="top"
                offset={[
                  0,
                  -28,
                ]}
              >

                📍 {objeto.nome}

              </Tooltip>


              {/* ========================================
                  INFORMAÇÕES
              ======================================== */}

              <Popup>

                <div
                  style={{
                    minWidth: '180px',
                  }}
                >

                  <strong>
                    {objeto.nome}
                  </strong>

                  <br />

                  ID:
                  {' '}
                  {objeto.id}

                  <hr />

                  🚗 Velocidade:
                  {' '}
                  {objeto.velocidade.toFixed(1)}
                  {' '}
                  km/h

                  <br />

                  🧭 Direção:
                  {' '}
                  {objeto.direcao}°

                  <br />

                  📍 Latitude:
                  {' '}
                  {objeto.latitude.toFixed(6)}

                  <br />

                  📍 Longitude:
                  {' '}
                  {objeto.longitude.toFixed(6)}

                  <br />

                  🔋 Bateria:
                  {' '}
                  {objeto.bateria ?? '--'}%

                  <br />

                  🎯 Precisão:
                  {' '}
                  {objeto.precisao ?? '--'}
                  {' '}
                  m

                  <br />

                  🕐 Última atualização:
                  <br />

                  {objeto.ultimaAtualizacao}

                </div>

              </Popup>

            </Marker>

          )
        )}


      <AtualizadorCamera
        objetos={objetos}
      />

    </MapContainer>
  )
}