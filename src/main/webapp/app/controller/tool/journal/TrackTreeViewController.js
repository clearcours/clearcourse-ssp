/*
 * Licensed to Jasig under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Jasig licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
Ext.define('Ssp.controller.tool.journal.TrackTreeViewController', {
    extend: 'Deft.mvc.ViewController',
    mixins: ['Deft.mixin.Injectable'],
    inject: {
        apiProperties: 'apiProperties',
        formUtils: 'formRendererUtils',
        journalEntry: 'currentJournalEntry',
        person: 'currentPerson',
        treeUtils: 'treeRendererUtils'
    },
    config: {
        containerToLoadInto: 'tools',
        formToDisplay: 'editjournal',
        journalTrackUrl: '',
        journalStepUrl: '',
        journalStepDetailUrl: ''
    },
    
    init: function(){
        var rootNode = null;
        this.journalTrackUrl = this.apiProperties.getItemUrl('journalTrack');
        this.journalStepUrl = this.apiProperties.getItemUrl('journalStep');
        this.journalStepDetailUrl = this.apiProperties.getItemUrl('journalStep');
        if (this.journalEntry.get('journalTrack') != null) {
            this.loadSteps();
        }
        
        
        return this.callParent(arguments);
    },
    
    destroy: function(){
        // clear the categories
        this.treeUtils.clearRootCategories();
        
        return this.callParent(arguments);
    },
	
	clearTrack: function() {
		this.treeUtils.clearRootCategories();
	},

    getTreeStore: function() {
        var me = this;
        return me.getView().getView().getTreeStore();
    },

    getLoadingRootNode: function() {
        var me = this;
        return me.loadingRootNode;
    },

    setLoadingRootNode: function(node) {
        var me = this;
        me.loadingRootNode = node;
    },

    getDisplayedRootNode: function() {
        var me = this;
        return me.getTreeStore().getRootNode();
    },

    setDisplayedRootNode: function(node) {
        var me = this;
        me.getTreeStore().setRootNode(node);
    },

    loading: function(yesNo) {
        var me = this;
        me.getView().getView().setLoading(yesNo);
    },

    loaded: function() {
        var me = this;
        me.setDisplayedRootNode(me.getLoadingRootNode());
        me.setLoadingRootNode(null);
        this.awaitingAfterJournalDetailsLoadedCallbacks = 0;
        this.loading(false);
    },

    resetForLoad: function() {
        var me = this;
        me.loading(true);
        me.treeUtils.clearRootCategories();
        var origRootNode = this.getDisplayedRootNode();
        me.setLoadingRootNode(origRootNode.copy(null, true));
        origRootNode.remove();
        this.awaitingAfterJournalDetailsLoadedCallbacks = 0;
    },

    loadSteps: function( journalTrack ) {

        this.resetForLoad();

        var journalTrackId = "";

        if ( journalTrack ) {
			journalTrackId = journalTrack;
		} else {
			if ( this.journalEntry.get('journalTrack') ) {
				journalTrackId = this.journalEntry.get('journalTrack').id;
			}
		}
        
        // load the steps
        if (journalTrackId != null && journalTrackId != "") {
            var treeRequest = new Ssp.model.util.TreeRequest();
            treeRequest.set('url', this.journalTrackUrl + '/' + journalTrackId + '/journalTrackJournalStep?limit=-1&status=ALL');
            treeRequest.set('nodeType', 'journalStep');
            treeRequest.set('isLeaf', false);
            treeRequest.set('enableCheckedItems', false);
            treeRequest.set('responseFilter', this.transformJournalTrackJournalStepAssociations);
            treeRequest.set('expanded', false);
            treeRequest.set('callbackFunc', this.afterJournalStepsLoaded);
            treeRequest.set('callbackScope', this);
            treeRequest.set('nodeToAppendTo', this.getLoadingRootNode());
            treeRequest.set('sortFunction', function(rec1, rec2){
            	if(rec1.objectStatus != rec2.objectStatus)
            		return rec1.objectStatus == 'ACTIVE' ? -1:1;
			   if(rec1.associatedToTrack != rec2.associatedToTrack)
		            		return rec1.associatedToTrack ? -1:1;
            	return rec1.sortOrder - rec2.sortOrder;
            });
            this.treeUtils.getItems(treeRequest);
        } else {
            this.loaded();
        }
    },

    transformJournalTrackJournalStepAssociations: function(assocs) {
        // Lots of copy/paste code from transformJournalStepJournalDetailAssociations()
        // that we're just living with for now
        var me = this;
        var unique = me.uniqueJournalTrackJournalStepAssociations(assocs);
        var transformed = [];
        Ext.Array.each(unique, function(assoc, index) {
        	if ( assoc.objectStatus === "ACTIVE" || me.isSelectedJournalTrackJournalStepAssociation(assoc) ) {
        		var journalStep = me.journalStepNodeItemFromTrackAssociation(assoc);
				journalStep.sortOrder = assoc.sortOrder;
        		journalStep.extraObsoleteText = '';
        		if(assoc.objectStatus !== "ACTIVE"){
        			journalStep.associatedToTrack = false;
        			journalStep.extraObsoleteText += " (Inactive)";
        		}else
        			journalStep.associatedToTrack = true;
                transformed.push(journalStep);
            }
        });
        return transformed;
    },
    
    

    uniqueJournalTrackJournalStepAssociations: function (assocs) {
        var me = this;
        return me.uniqueAssociations(assocs, function(assoc){
            // really only need the step ID for current usage, but the
            // track ID sets up the keyspace so we can handle an arbitrary
            // collection of associations
            return assoc.journalTrack.id + "_" + assoc.journalStep.id;
        });
    },

    // This tries to address the problem where you have multiple track->step
    // or step->detail associations that bind the same two objects together and
    // otherwise differ only in their objectStatus. I.e. someone deleted an
    // association then recreated it later. If the current journal entry
    // references *any* of those duplicate associations, *all* the duplicated
    // will appear unless we filter them out. That's what this method does.
    // Under current usage the identity of the association doesn't actually
    // matter on the client, so when this filter detect duplicates, it just uses
    // the first active association from among the duplicates.
    uniqueAssociations: function(assocs, keyBuilder) {
        var me = this;
        var unique = [];
		var recordsToDelete = [];
		var deleteCount = 0;
        var index = {}; // field names: assoc keys from keyBuilder callback
                        // field values: association objectStatus and "pos"
                        //               which is an index into the "unique"
                        //               array
        Ext.Array.each(assocs, function(assoc, j){
            var key = keyBuilder.apply(me, [ assoc ]);
            var indexRecord = index[key];
            if ( indexRecord && indexRecord.objectStatus !== 'ACTIVE' && assoc.objectStatus === 'ACTIVE' ) {
                // replace inactive record with active record
                unique[indexRecord.pos] = assoc;
                indexRecord.objectStatus = 'ACTIVE';
            } else if ( !(indexRecord) ) {
                index[key] = {
                    objectStatus: assoc.objectStatus,
                    pos: (unique.push(assoc) - 1)
                }
            } else {
                // true duplicate, do nothing
            }
        });
        return unique;
    },

    isSelectedJournalTrackJournalStepAssociation: function(assoc) {
        // Lots of copy/paste code from isSelectedJournalStepJournalDetailAssociation()
        // that we're just living with for now

        var me = this;
        var journalEntryDetails = me.journalEntry.get("journalEntryDetails");
        if ( !(journalEntryDetails) ) {
            return false;
        }

        var assocJournalStepId = assoc.journalStep && assoc.journalStep.id;
        if ( !(assocJournalStepId) ) {
            return false;
        }
        return journalEntryDetails.some(function(journalEntryDetail, index){
            if ( journalEntryDetail.objectStatus !== 'ACTIVE' ) {
                return false;
            }
            var journalStep = journalEntryDetail.journalStep;
            return journalStep && journalStep.id === assocJournalStepId;
        });
    },

    journalStepNodeItemFromTrackAssociation: function(assoc) {
        return assoc.journalStep;
    },

    afterJournalStepsLoaded: function(scope){
        // after the journal steps load expand them to
        // display the details under each step.
        //
        // Don't try to do this using getLoadingRootNode().expandChildren().
        // The children of LoadingRootNode aren't displayed yet (they're
        // loading), so the corresponding view event won't fire and thus
        // whatever function we want to use to actually deal with the expansion
        // won't be called. Instead, we do that explicitly here.
        var me = scope;
        var rootNode = me.getLoadingRootNode();
        var anyChildren = false;
        rootNode.eachChild(function(node) {
            anyChildren = true;
            me.awaitingAfterJournalDetailsLoadedCallbacks++;
            node.expand();
            me.loadDetailsForStepNode(node);
        });

        if ( !(anyChildren) ) {
            me.loaded();
        }
    },

    loadDetailsForStepNode: function(nodeInt, obj){
        var me = this;
        var node = nodeInt;
        var url = me.journalStepDetailUrl;
        var id = me.treeUtils.getIdFromNodeId(node.data.id);
        if (url != "") {
            var treeRequest = new Ssp.model.util.TreeRequest();
            // can't sort on name here... these objects have no name
            treeRequest.set('url', url + '/' + id + '/journalStepJournalStepDetail?limit=-1&status=ALL');
            treeRequest.set('nodeType', 'journalDetail');
            treeRequest.set('isLeaf', true);
            treeRequest.set('nodeToAppendTo', node);
            treeRequest.set('enableCheckedItems', true);
            treeRequest.set('responseFilter', me.transformJournalStepJournalDetailAssociations);
            treeRequest.set('callbackFunc', me.afterJournalDetailsLoaded);
            treeRequest.set('callbackScope', me);
            treeRequest.set('removeParentWhenNoChildrenExist', true);            
            treeRequest.set('node', node);
            treeRequest.set('sortFunction', function(rec1, rec2){
            	if(rec1.objectStatus != rec2.objectStatus)
            		return rec1.objectStatus == 'ACTIVE' ? -1:1;
			   if(rec1.associatedToStep != rec2.associatedToStep)
		            		return rec1.associatedToStep ? -1:1;
            	return rec1.sortOrder - rec2.sortOrder;
            });
            me.treeUtils.getItems(treeRequest);
        }
    },

    transformJournalStepJournalDetailAssociations: function(assocs) {
        var me = this;
        var unique = me.uniqueJournalStepJournalDetailAssociations(assocs);
        var transformed = [];
        Ext.Array.each(unique, function(assoc, index) {
            if ( assoc.objectStatus === "ACTIVE" || me.isSelectedJournalStepJournalDetailAssociation(assoc) ) {
				var journalDetail = me.journalDetailNodeItemFromStepAssociation(assoc);
				journalDetail.extraObsoleteText = '';
				if(assoc.objectStatus !== "ACTIVE"){
					journalDetail.associatedToStep = false;
					journalDetail.extraObsoleteText += " (Inactive)";
				}else
					journalDetail.associatedToStep = true;
                transformed.push(journalDetail);
            }
        });
        return transformed;
    },

    uniqueJournalStepJournalDetailAssociations: function (assocs) {
        var me = this;

        return me.uniqueAssociations(assocs, function(assoc){
            // really only need the detail ID for current usage, but the
            // step ID sets up the keyspace so we can handle an arbitrary
            // collection of associations
            return assoc.journalStep.id + "_" + assoc.journalStepDetail.id;
        });
    },

    isSelectedJournalStepJournalDetailAssociation: function(assoc) {
        var me = this;
        var journalEntryDetails = me.journalEntry.get("journalEntryDetails");
        if ( !(journalEntryDetails) ) {
            return false;
        }

        // Journal entry API doesn't actually track step/detail assoc IDs, even
        // though that's what's happening on the back end.
        var assocJournalStepId = assoc.journalStep && assoc.journalStep.id;
        var assocJournalStepDetailId = assoc.journalStepDetail && assoc.journalStepDetail.id;
        if ( !(assocJournalStepId) || !(assocJournalStepDetailId) ) {
            return false;
        }
        return journalEntryDetails.some(function(journalEntryDetail, index){
            if ( journalEntryDetail.objectStatus !== 'ACTIVE' ) {
                return false;
            }
            var journalStep = journalEntryDetail.journalStep;
            if ( !(journalStep && journalStep.id === assocJournalStepId) ) {
                return false;
            }
            var journalStepDetails = journalEntryDetail.journalStepDetails;
            if ( !(journalStepDetails) ) {
                return false;
            }
            return journalStepDetails.some(function(journalStepDetail, index){
                return journalStepDetail.id === assocJournalStepDetailId;
            });
        });
    },

    journalDetailNodeItemFromStepAssociation: function(assoc) {
        return assoc.journalStepDetail;
    },

    afterJournalDetailsLoaded: function(scope, node){

        scope.awaitingAfterJournalDetailsLoadedCallbacks--;

        // after the journal details load select each detail
        // that is selected in the journal
        var journalEntryDetails = scope.journalEntry.get("journalEntryDetails");
        
        if (journalEntryDetails != "" && journalEntryDetails != null) {
        
            Ext.Array.each(journalEntryDetails, function(item, index){

                if ( item.objectStatus === 'ACTIVE' ) {

                    var journalStepDetails = item.journalStepDetails;
                    var journalStep = item.journalStep;
                    var counter = 0;

                    Ext.Array.each(journalStepDetails, function(innerItem, innerIndex){

                        var parentNode = scope.getLoadingRootNode().findChild('id', (journalStep.id + '_journalStep'), true);
                        if(parentNode != null){
                        	var detailNode = parentNode.findChild('id', (innerItem.id + '_journalDetail'), true);

                        	if (detailNode != null) {
                        		detailNode.set('checked', true);
                        	}
                        }

                    });
                }
                
            });
        }
        
        var children = node.childNodes;
        if ( !(children) || !(children.length) ) {
            node.remove();
        }

        if ( scope.awaitingAfterJournalDetailsLoadedCallbacks <= 0 ) {
            scope.loaded();
        }
    },

    
    onSaveClick: function(button){
        var me = this;
        
        me.save();
    },
    
    save: function(){
        var me = this;
        var journalEntry = me.journalEntry;
        var tree = me.getView();
        var treeUtils = me.treeUtils;
        var records = tree.getView().getChecked();
        journalEntry.removeAllJournalEntryDetails();
        var je = journalEntry;
        // add/remove the detail from the Journal Entry
        Ext.Array.each(records, function(record, index){
            var id = me.treeUtils.getIdFromNodeId(record.data.id);
            var childText = record.data.text;
            var parentId = me.treeUtils.getIdFromNodeId(record.data.parentId);
            var parentText = record.parentNode.data.text;
            var step = null;
            var detail = null;
            
            step = {
                "id": parentId,
                "name": parentText
            };
            detail = {
                "id": id,
                "name": childText
            };
            // add journal detail
            journalEntry.addJournalDetail(step, detail);
        }, this);
        
    },
    
    
    displayJournalEditor: function(){
        var comp = this.formUtils.loadDisplay(this.getContainerToLoadInto(), this.getFormToDisplay(), true, {});
    },

    sortBy: function(array, field) {
        array.sort(function(a,b){
            var fieldA = a[field];
            var fieldB = b[field];
            if ( fieldA < fieldB ) {
                return -1;
            }
            return (fieldA > fieldB) ? 1 : 0;
        });
        return array; // just to make chaining easier
    }
    
});