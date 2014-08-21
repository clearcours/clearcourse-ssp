/**
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
package org.jasig.ssp.model;

import java.util.Date;
import java.util.UUID;

public class EarlyAlertSearchResult {

	private Date createdDate;

	private Date closedDate;

	private Date lastResponseDate;

	private String courseTermCode;
	
	private String courseTermName;
	
	private Date courseTermStartDate;

	private String courseTitle;

	private String courseName;
	
	private UUID earlyAlertId;
	
	private EarlyAlertStatus status;

	public EarlyAlertSearchResult() {

	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public EarlyAlertStatus getStatus() {
		if(status == null)
			setStatus();
		return status;
	}
	
	public void setStatus() {
		status = closedDate == null ? EarlyAlertStatus.OPEN : EarlyAlertStatus.CLOSED;
	}
	
	public void setStatus(EarlyAlertStatus status) {
		this.status = status;
	}
	

	public Date getLastResponseDate() {
		return lastResponseDate;
	}

	public void setLastResponseDate(Date lastResponseDate) {
		this.lastResponseDate = lastResponseDate;
	}

	public String getCourseTitle() {
		return courseTitle;
	}

	public void setCourseTitle(String courseTitle) {
		this.courseTitle = courseTitle;
	}


	public String getCourseName() {
		return courseName;
	}

	public void setCourseName(String courseName) {
		this.courseName = courseName;
	}

	public UUID getEarlyAlertId() {
		return earlyAlertId;
	}

	public void setEarlyAlertId(UUID earlyAlertId) {
		this.earlyAlertId = earlyAlertId;
	}

	public String getCourseTermName() {
		return courseTermName;
	}

	public void setCourseTermName(String courseTermName) {
		this.courseTermName = courseTermName;
	}
	
	public String getCourseTermCode() {
		return courseTermCode;
	}

	public void setCourseTermCode(String courseTermCode) {
		this.courseTermCode = courseTermCode;
	}

	public Date getClosedDate() {
		return closedDate;
	}

	public void setClosedDate(Date closedDate) {
		if(closedDate != null)
			setStatus(EarlyAlertStatus.CLOSED);
			
		this.closedDate = closedDate;
	}

	public Date getCourseTermStartDate() {
		return courseTermStartDate;
	}

	public void setCourseTermStartDate(Date courseTermStartDate) {
		this.courseTermStartDate = courseTermStartDate;
	}

}
