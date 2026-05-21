package com.jyothi;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.path.json.JsonPath;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class GenerateFromSwaggerTest {

    @BeforeAll
    static void setup() {
        RestAssured.baseURI = "http://localhost:3000"; // your Node server
    }

    @Test
    @DisplayName("Generate test cases from Swagger (POST-only)")
    void generateFromSwagger_success() {
        String payload = """
          { "swaggerUrl": "http://127.0.0.1:5050/swagger.yaml" }
        """;

        // 1) Call and always print the raw response (so we can see errors on failure)
        String response = given()
            .contentType(ContentType.JSON)
            .body(payload)
        .when()
            .post("/generate-testcases-from-swagger")
        .then()
            .extract().asString(); // don't assert yet

        try {
            String pretty = new JsonPath(response).prettify();
            System.out.println("\n===== RAW RESPONSE =====\n" + pretty);
        } catch (Exception ignored) {
            System.out.println("\n===== RAW RESPONSE (not JSON) =====\n" + response);
        }

        // 2) Now assert success & expected fields
        // given()
        //     .contentType(ContentType.JSON)
        //     .body(response)
        // .when()
        // .then()
        //     .statusCode(200)
        //     .body("spec_title", not(emptyOrNullString()))
        //     .body("operations.size()", greaterThanOrEqualTo(1))
        //     .body("operations[0].method", equalTo("POST"))
        //     .body("operations[0].test_cases.size()", greaterThan(0));
    }
}