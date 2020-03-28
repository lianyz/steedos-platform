if (!db.flow_roles) {
  db.flow_roles = new Meteor.Collection('flow_roles');
}

if (Meteor.isClient) {
  db.flow_roles._sortFunction = function (doc1, doc2) {
    var ref2;
    return (ref2 = doc1.name) != null ? ref2.localeCompare(doc2.name) : void 0;
  };
  db.flow_roles.before.find(function (userId, selector, options) {
    if (!options) {
      options = {};
    }
    return options.sort = db.flow_roles._sortFunction;
  });
}

if (Meteor.isServer) {
  db.flow_roles.allow({
    insert: function (userId, event) {
      if (!Steedos.isSpaceAdmin(event.space, userId)) {
        return false;
      } else {
        return true;
      }
    },
    remove: function (userId, event) {
      if (!Steedos.isSpaceAdmin(event.space, userId)) {
        return false;
      } else {
        return true;
      }
    }
  });
  db.flow_roles.before.insert(function (userId, doc) {
    doc.created_by = userId;
    return doc.created = new Date();
  });
  db.flow_roles.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.modified_by = userId;
    return modifier.$set.modified = new Date();
  });
  db.flow_roles.before.remove(function (userId, doc) {
    var flowNames, roleId;
    if (db.flow_positions.find({
      role: doc._id
    }).count() > 0) {
      throw new Meteor.Error(400, "flow_roles_error_positions_exists");
    }
    flowNames = [];
    roleId = doc._id;
    _.each(db.flows.find({
      space: doc.space
    }, {
        fields: {
          name: 1,
          'current.steps': 1
        }
      }).fetch(), function (f) {
        return _.each(f.current.steps, function (s) {
          if (s.deal_type === 'applicantRole' && s.approver_roles.includes(roleId)) {
            return flowNames.push(f.name);
          }
        });
      });
    if (!_.isEmpty(flowNames)) {
      throw new Meteor.Error(400, "flow_roles_error_flows_used", {
        names: _.uniq(flowNames).join(',')
      });
    }
  });
  db.flow_roles._ensureIndex({
    "space": 1,
    "created": 1
  }, {
      background: true
    });
  db.flow_roles._ensureIndex({
    "space": 1,
    "created": 1,
    "modified": 1
  }, {
      background: true
    });
}

new Tabular.Table({
  name: "flow_roles",
  collection: db.flow_roles,
  columns: [
    {
      data: "name"
    }
  ],
  dom: "tp",
  lengthChange: false,
  ordering: false,
  pageLength: 10,
  info: false,
  extraFields: ["space", "_id"],
  searching: true,
  autoWidth: false,
  changeSelector: function (selector, userId) {
    if (!userId) {
      return {
        _id: -1
      };
    }
    return selector;
  }
});
