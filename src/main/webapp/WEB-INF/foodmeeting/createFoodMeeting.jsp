<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
    <jsp:attribute name="javascript">
        <script>
            $(document).ready(function() {
                $("#friends").select2({
                    placeholder: 'Add participants',
                    allowClear: true,
                    ajax: {
                        url: "http://localhost:8080/action/action/UserPagination",
                        dataType: 'json',
                        delay: 250,
                        data: function(params) {
                            return {
                                term: params.term, // search term
                                page: params.page
                            };
                        },
                        processResults: function(data, params) {
                            params.page = params.page || 1;

                            return {
                                results: data.results,
                            };
                        },
                        cache: true
                    },
                    escapeMarkup: function(markup) {
                        return markup;
                    }, // let our custom formatter work
                    minimumInputLength: 2,
                    templateResult: formatRepo, // omitted for brevity, see the source of this page
                    templateSelection: formatRepoSelection // omitted for brevity, see the source of this page
                });
            });

            function formatRepo(repo) {
                if (repo.loading)
                    return repo.text;
                var tmpl = $.templates("#repoTmpl");
                return tmpl.render(repo);
            }

            function formatRepoSelection(repo) {
                return repo.name || repo.text;
            }
        </script>

        <script id="repoTmpl" type="text/x-jsrender">
            <div class='select2-result-repository clearfix'>
            <div class='select2-result-repository__avatar'></div>
            <div class='select2-result-repository__meta'> 
            <div class='select2-result-repository__title'>{{:name}} {{:last_name}}</div>
            <div class='select2-result-repository__description'>{{:email}}</div>
            </div>
            </div>
        </script>
    </jsp:attribute>

    <jsp:body>
        <div class="row">
            <div class="col-md-6">
                <form role="form" action="/action/createFoodMeeting" method="post" class="col-md-9 go-right">
                    <h2>Create food meeting</h2>
                    <div class="form-group">
                        <input id="name" name="name" type="text" class="form-control" required>
                        <label for="name">Your Name</label>
                    </div>
                    <div class="form-group">
                        <select id="friends" name="friends" class="form-control" multiple="multiple">

                        </select>
                    </div>
                    <div class="form-group">
                        <textarea id="message" name="phone" class="form-control" required></textarea>
                        <label for="message">Message</label>
                    </div>
                    <button type="submit">Save</button>
                </form>
            </div>
            <div class="col-md-6">


            </div>
        </div>
    </jsp:body>
</t:template>