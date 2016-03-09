<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="description" lang="en" content="jQuery multiselect plugin with two sides. The user can select one or more items and send them to the other side."/>
    <meta name="keywords" lang="en" content="jQuery multiselect plugin" />

    <title>Test</title>
    
    <link rel="icon" type="image/x-icon" href="https://github.com/favicon.ico" />
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css" />
    <link rel="stylesheet" href="lib/google-code-prettify/prettify.css" />
    <link rel="stylesheet" href="css/style.css" />
</head>
<body>


	<h4 id="demo-search">With search</h4>
	<form method='post'> 
	<div class="row">
	    <div class="col-sm-5">
	    	<div class="col-xs-12  no-padding" style="margin-top: 10px;" > <p style="font-weight: bold">All</p> </div>
	        <select id="multselect" class="form-control" size="15" multiple="multiple">
	        	<!-- Add all options -->
	        	<?php for ($i=0; $i < 2000; $i++): ?>
	        		<option value="role_id-<?= $i ?>" data-position="<?=$i?>"><?= $i ?>- Job Code</option>
	        	<?php endfor ?>

	        </select>
	    	<div class="col-xs-12  no-padding" style="margin-top: 10px;" > <p style="font-weight: bold">Bulk Importer</p></div>
	    </div>

	    <div class="col-sm-2" style="margin-top:75px">

	        <button type="button" id="multselect_rightAll" class="btn btn-block"><i class="glyphicon glyphicon-forward"></i></button>
	        <button type="button" id="multselect_rightSelected" class="btn btn-block"><i class="glyphicon glyphicon-chevron-right"></i></button>
	        <button type="button" id="multselect_leftSelected" class="btn btn-block"><i class="glyphicon glyphicon-chevron-left"></i></button>
	        <button type="button" id="multselect_leftAll" class="btn btn-block"><i class="glyphicon glyphicon-backward"></i></button>
	    </div>
	    
	    <div class="col-sm-5">
	    	<div class="col-xs-12  no-padding" style="margin-top: 10px;" > <p style="font-weight: bold">Selected</p> </div>
	        <select name="employeeRoles" id="multselect_to" class="form-control" size="15" multiple="multiple">
	        	<!-- add selected options, these will automatically get removed from the left one if they exists -->
	        	<?php for ($i=5; $i < 100; $i++): ?>
	        		<option value="role_id-<?= $i ?>" data-position="<?=$i?>"><?= $i ?>- Job Code</option>
	        	<?php endfor ?>
	        </select>
	    </div>
	</div>
	<input type="submit" value="Submit"> 
	</form>
    <!-- <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script> -->
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.1/jquery.min.js"></script>
    <script type="text/javascript" src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/prettify/r298/prettify.min.js"></script>
    <script type="text/javascript" src="js/multiselect.min.js"></script>
    <script type="text/javascript">

    $(document).ready(function() {
    	
		$('#multselect').multiselect({
            search: {
                left: '<input type="text" class="form-control" placeholder="Search..." />',
                right: '<input type="text" class="form-control" placeholder="Search..." />',
            },
            bulk: {
		 		left: '<textarea class="form-control" style="height: 100px" ></textarea>'
            },
            keepRenderingSort: true,
            submitAllLeft: false
        });
	});

    </script>
</body>