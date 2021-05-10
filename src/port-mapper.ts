const mapPorts = (
  ports: string
): Array<{
  mapped?: { address: string; port: number }
  exposed: { port: number; protocol: string }
}> => {
  const result = !ports
    ? []
    : (() => {
        return ports.split(',').map((untypedPort) => {
          const exposedFragments = untypedPort.trim().split('->')

          const [port, protocol] =
            exposedFragments.length === 1
              ? exposedFragments[0].split('/')
              : exposedFragments[1].split('/')
          const [address, mappedPort] =
            exposedFragments.length === 2 ? exposedFragments[0].split(':') : []
          return {
            exposed: { port: Number(port), protocol },
            ...(address &&
              mappedPort && { mapped: { port: Number(mappedPort), address } })
          }
        })
      })()
  return result
}

export default mapPorts
