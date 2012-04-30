package org.studentsuccessplan.mygps.web;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.List;
import java.util.UUID;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.transaction.TransactionConfiguration;
import org.springframework.transaction.annotation.Transactional;
import org.studentsuccessplan.mygps.model.transferobject.SelfHelpGuideResponseTO;
import org.studentsuccessplan.ssp.model.Person;
import org.studentsuccessplan.ssp.model.reference.Challenge;
import org.studentsuccessplan.ssp.service.impl.SecurityServiceInTestEnvironment;
import org.studentsuccessplan.ssp.transferobject.reference.ChallengeTO;
import org.studentsuccessplan.ssp.web.api.AbstractControllerHttpTestSupport;
import org.studentsuccessplan.ssp.web.api.reference.ChallengeController;

/**
 * {@link MyGpsSelfHelpGuideResponseController} tests
 * 
 * @author jon.adams
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("../../ssp/web/ControllerIntegrationTests-context.xml")
@TransactionConfiguration
@Transactional
public class MyGpsSelfHelpGuideResponseControllerIntegrationTest
		extends
		AbstractControllerHttpTestSupport<ChallengeController, ChallengeTO, Challenge> {

	private static final UUID SELFHELPGUIE_ID = UUID
			.fromString("4fd534df-e7fe-e555-7c71-0042593b1990");

	private static final UUID SELFHELPGUIDEQUESTION_ID = UUID
			.fromString("0e46733e-193d-4950-ba29-4cd0f9620561");

	private static final UUID CHALLENGE_ID = UUID
			.fromString("38f7ae25-902f-4381-851e-2e2319adb1bd");

	@Autowired
	private transient MyGpsSelfHelpGuideResponseController controller;

	@Autowired
	private transient SecurityServiceInTestEnvironment securityService;

	/**
	 * Setup the security service with the administrator user.
	 */
	@Override
	@Before
	public void setUp() {
		super.setUp();
		securityService.setCurrent(new Person(Person.SYSTEM_ADMINISTRATOR_ID));
	}

	/**
	 * Test the {@link MyGpsSelfHelpGuideResponseController#complete(UUID)}
	 * action.
	 * 
	 * @throws Exception
	 *             Thrown if the controller throws any exceptions.
	 */
	@Test
	public void testControllerComplete() throws Exception {
		assertNotNull(
				"Controller under test was not initialized by the container correctly.",
				controller);

		final UUID shgrId = UUID.fromString(controller
				.initiate(SELFHELPGUIE_ID));

		boolean success = controller.answer(shgrId, SELFHELPGUIDEQUESTION_ID,
				true);
		assertTrue("Expected success from answer().", success);

		success = controller.complete(shgrId);
		assertTrue("Expected success from answer().", success);

		final SelfHelpGuideResponseTO obj = controller.getById(shgrId);
		final List<ChallengeTO> challenges = obj.getChallengesIdentified();
		assertFalse("Challenges identified should not have been empty.",
				challenges.isEmpty());

		final ChallengeTO challenge = challenges.get(0);
		assertEquals("Challenge ID did not match.", CHALLENGE_ID,
				challenge.getId());
	}
}
