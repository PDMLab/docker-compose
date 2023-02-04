import mapPorts from '../../src/map-ports'

test('map ports for empty string', () => {
  expect(mapPorts('')).toEqual([])
})

test('map ports for exposed tcp', () => {
  expect(mapPorts('80/tcp')).toEqual([
    { exposed: { port: 80, protocol: 'tcp' } }
  ])
})

test('map ports for exposed tcp on ivp4 interface', () => {
  expect(mapPorts('0.0.0.0:443->443/tcp')).toEqual([
    {
      exposed: { port: 443, protocol: 'tcp' },
      mapped: { address: '0.0.0.0', port: 443 }
    }
  ])
})

test('map multiple tcp ports exposed on ivp4 interfaces', () => {
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

test('map multiple tcp ports exposed on ipv4 and ipv6 interfaces', () => {
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
