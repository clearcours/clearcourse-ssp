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
Ext.define('Ssp.controller.tool.actionplan.CustomActionPlanViewController', {
    extend: 'Deft.mvc.ViewController',
    mixins: ['Deft.mixin.Injectable'],
    inject: {
        apiProperties: 'apiProperties',
        appEventsController: 'appEventsController',
        authenticatedPerson: 'authenticatedPerson',
        formUtils: 'formRendererUtils',
        model: 'currentTask',
        personLite: 'personLite',
        store: 'addTasksStore',
        confidentialityLevelsStore: 'confidentialityLevelsAllUnpagedStore'
    },
    
    control: {
        
        
        addCustomActionPlanButton: {
            selector: '#addCustomActionPlanButton',
            listeners: {
                click: 'onAddCustomActionPlanButtonClick'
            }
        }
    },
    
     init: function() {
        var me = this;
        me.formUtils.applyActiveOnlyFilter(me.confidentialityLevelsStore);
        return me.callParent(arguments);
    },
    
    onAddCustomActionPlanButtonClick: function(button){
        var me = this;
        var form = Ext.ComponentQuery.query('.customactionplan > form')[0];
        
        var customForm = form.getForm();
		
		var validateResult = me.formUtils.validateForms( customForm );
		
		if (validateResult.valid) {
		
			var task = new Ssp.model.tool.actionplan.Task();
			task.set('name', customForm.findField('name').getValue());
			task.set('description', customForm.findField('description').getValue());
			task.set('link', customForm.findField('link').getValue());
			task.set('dueDate', customForm.findField('dueDate').getValue());
			task.set('confidentialityLevel', customForm.findField('confidentialityLevelId').lastSelection[0].data);
			
			me.store.add(task);
			Ext.ComponentQuery.query('.customactionplan')[0].close();
		}
		else{
			me.formUtils.displayErrors( validateResult.fields );
		}
        
    }
});
