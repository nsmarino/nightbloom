export default {
    title: 'Interaction',
    name: 'interaction',
    type: 'document',
    fields: [
        {
            title: 'Title',
            name: 'title',
            type: 'string',
            validation: Rule => Rule.required()
        },
        {
            title: 'Mesh',
            name: 'mesh',
            type: 'file',
            fields: [
              {
                name: 'meshName',
                type: 'string',
                title: 'Mesh Name'
              }
            ]
        }, 
        {
          title: "Interaction content",
          name: "content",
          type: "array",
          of: [
            { type: "contentNode" }
          ]
        }
    ]
}