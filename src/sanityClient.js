import sanityClient from "@sanity/client"

const client = sanityClient({
    // TODO: move this into a .env
    projectId: 'sm3dxrpw', 
    dataset: 'plateau',
    apiVersion: '2021-03-25',
    useCdn: false, // `false` if you want to ensure fresh data
  })

export default client