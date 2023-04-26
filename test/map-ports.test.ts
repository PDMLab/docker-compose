import mapPorts from '../src/v2-map-ports'
import { describe, expect, it } from 'vitest'

describe('when no ports are exposed', (): void => {
  it('maps ports for empty string', () => {
    expect(mapPorts('')).toEqual([])
  })
})

describe('when an exposed tcp port exists', (): void => {
  it('maps ports for exposed tcp', () => {
    expect(mapPorts('80/tcp')).toEqual([
      { exposed: { port: 80, protocol: 'tcp' } }
    ])
  })
})

describe('when exposed port on ipv4 interface exists', (): void => {
  it('maps ports for exposed tcp on ivp4 interface', () => {
    expect(mapPorts('0.0.0.0:443->443/tcp')).toEqual([
      {
        exposed: { port: 443, protocol: 'tcp' },
        mapped: { address: '0.0.0.0', port: 443 }
      }
    ])
  })
})

describe('when multiple tcp ports on ipv4 interface are exposed', (): void => {
  it('maps multiple tcp ports exposed on ivp4 interfaces', () => {
    expect(mapPorts('0.0.0.0:443->443/tcp, 0.0.0.0:80->80/tcp')).toEqual([
      {
        exposed: { port: 443, protocol: 'tcp' },
        mapped: { address: '0.0.0.0', port: 443 }
      },
      {
        exposed: { port: 80, protocol: 'tcp' },
        mapped: { address: '0.0.0.0', port: 80 }
      }
    ])
  })
})

describe('when multiple ports are exposed on ipv4 and ipv6', (): void => {
  it('maps multiple tcp ports exposed on ipv4 and ipv6 interfaces', () => {
    expect(
      mapPorts(
        '0.0.0.0:443->443/tcp,:::443->443/tcp, 0.0.0.0:80->80/tcp,:::80->80/tcp'
      )
    ).toEqual([
      {
        exposed: { port: 443, protocol: 'tcp' },
        mapped: { address: '0.0.0.0', port: 443 }
      },
      {
        exposed: { port: 443, protocol: 'tcp' },
        mapped: { address: '::', port: 443 }
      },
      {
        exposed: { port: 80, protocol: 'tcp' },
        mapped: { address: '0.0.0.0', port: 80 }
      },
      {
        exposed: { port: 80, protocol: 'tcp' },
        mapped: { address: '::', port: 80 }
      }
    ])
  })
})
