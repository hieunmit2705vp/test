package backend.cnpm.services.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;

@Service
public class SchemaService {

    @Autowired
    private DataSource dataSource;

    public String getSchemaDescription() {
        StringBuilder schema = new StringBuilder();
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            String catalog = connection.getCatalog();

            // Get tables
            ResultSet tables = metaData.getTables(catalog, null, "%", new String[] { "TABLE" });
            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                if (tableName.startsWith("hibernate_") || tableName.equals("flyway_schema_history")) {
                    continue;
                }

                schema.append("Table ").append(tableName).append("\n");

                // Get columns
                ResultSet columns = metaData.getColumns(catalog, null, tableName, "%");
                while (columns.next()) {
                    String columnName = columns.getString("COLUMN_NAME");
                    String columnType = columns.getString("TYPE_NAME");
                    schema.append("  - ").append(columnName).append(" ").append(columnType).append("\n");
                }
                schema.append("\n");
            }
        } catch (SQLException e) {
            return "Error reading schema: " + e.getMessage();
        }
        return schema.toString();
    }
}
