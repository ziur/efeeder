
package org.jala.efeeder.places;

import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;

/**
 *
 * @author ricardo_ramirez
 */
@Command
public class SearchPlaceCommand extends MockCommandUnit {
	private static final Logger LOG = Logger.getLogger(SearchPlaceCommand.class.getName());
	private static final int ENTRIES_BY_PAGE = 10;
	private static final String SEARCH_PLACES_QUERY_PATTERN =
		"select * from places where places.name like '%%%s%%' or id in (select tp.id_place from tag_places as tp where tp.id_tag in (select t.id from tags as t where t.name like '%%%s%%')) LIMIT %d OFFSET %d";
	         
	@Override
	public Out execute() throws Exception {
		int page = 1;
		String term = parameters.getParameter("term");
		try {
			page = Integer.parseInt(parameters.getParameter("page"));
		} catch (Exception e) {
			LOG.info("Page not found");
		}
		page --;

		Statement statement = parameters.getConnection().createStatement();
		String query = prepareQuery(term, ENTRIES_BY_PAGE, ENTRIES_BY_PAGE*page);
		
		ResultSet resultSet = statement.executeQuery(query);
		
		List<Place> places = new ArrayList<>();
		while (resultSet.next()) {
			places.add(new Place(resultSet.getInt("id"), 
					resultSet.getString("name"), 
					resultSet.getString("description"), 
					resultSet.getString("phone"),
					resultSet.getString("direction"),
					resultSet.getString("image_link")));
		}
		return OutBuilder.response("application/json", JsonConverter.objectToJSON(places));
	}

	private String prepareQuery(String term, int ENTRIES_BY_PAGE, int page) {
		if (term == null || term.isEmpty()) {
			return String.format(SEARCH_PLACES_QUERY_PATTERN, "", "", ENTRIES_BY_PAGE, page);
		} else { 
			return String.format(SEARCH_PLACES_QUERY_PATTERN, term, term, ENTRIES_BY_PAGE, page);
		}
	}
}