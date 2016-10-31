package org.jala.efeeder.servlets;

import static org.quartz.CronScheduleBuilder.cronSchedule;
import static org.quartz.JobBuilder.newJob;
import static org.quartz.TriggerBuilder.newTrigger;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

import org.apache.log4j.Logger;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.impl.StdSchedulerFactory;

import org.jala.efeeder.scheduledJobs.ChangeMeetingStateJob;

/**
 *
 * @author Mirko Terrazas
 */
public class StartUpServlet extends HttpServlet {
	
	private Scheduler scheduler = null;		
	private final static Logger logger = Logger.getLogger(StartUpServlet.class);
	
	@Override
	public void init(ServletConfig config) throws ServletException {				
		try {
			scheduler = StdSchedulerFactory.getDefaultScheduler();
			scheduler.start();
			
			JobDetail changeMeetingStateJob = newJob(ChangeMeetingStateJob.class)
				.withIdentity("changeMeetingStateJob", "maintenanceJobs")
				.build();

			Trigger changeMeetingStateTrigger = newTrigger()
				.withIdentity("changeMeetingStateTrigger", "maintenanceJobs")
				.withSchedule(cronSchedule("0 0/1 * * * ?"))
				.build();

			scheduler.scheduleJob(changeMeetingStateJob, changeMeetingStateTrigger);
		} catch (SchedulerException ex) {
			logger.error("Error when trying to start quartz jobs scheduler.", ex);			
		}
			
	}
	
	@Override
	public void destroy (){
		try {
			scheduler.shutdown();
		} catch (SchedulerException ex) {
			logger.error("Error trying to shutdown quartz jobs scheduler", ex);					
		}
	}
}
