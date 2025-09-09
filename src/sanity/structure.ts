import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content Management')
    .items([
      // Features organized by sections
      S.listItem()
        .title('Features')
        .child(
          S.list()
            .title('Feature Sections')
            .items([
              S.listItem()
                .title('Core Features (1-5)')
                .child(
                  S.documentTypeList('feature')
                    .title('Core Features (1-5)')
                    .filter('_type == "feature" && order >= 1 && order <= 5')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                ),
              S.listItem()
                .title('Stories (6-11)')
                .child(
                  S.documentTypeList('feature')
                    .title('Stories (6-11)')
                    .filter('_type == "feature" && order >= 6 && order <= 11')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                ),
              S.listItem()
                .title('Other Features (12+)')
                .child(
                  S.documentTypeList('feature')
                    .title('Other Features (12+)')
                    .filter('_type == "feature" && order >= 12')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                ),
              S.divider(),
              S.listItem()
                .title('📝 Draft Features')
                .child(
                  S.documentTypeList('feature')
                    .title('Draft Features')
                    .filter('_type == "feature" && workflowStatus == "draft"')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                ),
              S.listItem()
                .title('👀 In Review')
                .child(
                  S.documentTypeList('feature')
                    .title('Features In Review')
                    .filter('_type == "feature" && workflowStatus == "review"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
              S.listItem()
                .title('🚀 Published Features')
                .child(
                  S.documentTypeList('feature')
                    .title('Published Features')
                    .filter('_type == "feature" && workflowStatus == "published"')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                ),
              S.divider(),
              S.listItem()
                .title('All Features')
                .child(
                  S.documentTypeList('feature')
                    .title('All Features')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                ),
            ])
        ),
      S.divider(),
      // Version History
      S.listItem()
        .title('📜 Version History')
        .child(
          S.documentTypeList('versionHistory')
            .title('Version History')
            .defaultOrdering([{field: 'timestamp', direction: 'desc'}])
        ),
      S.divider(),
      // Blog content
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('author').title('Authors'),
      S.divider(),
      // Other content types
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['post', 'category', 'author', 'feature', 'versionHistory'].includes(item.getId()!),
      ),
    ])
