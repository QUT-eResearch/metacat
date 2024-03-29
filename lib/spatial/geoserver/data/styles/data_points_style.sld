<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0"
	xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
	xmlns="http://www.opengis.net/sld"
	xmlns:ogc="http://www.opengis.net/ogc"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <UserLayer>
        <Name>metacat:data_points</Name>
	<UserStyle>
		<Name>Default Styler</Name>
		<Title>Default Styler</Title>
		<Abstract />
		<FeatureTypeStyle>
			<FeatureTypeName>Feature</FeatureTypeName>
			<Rule>
				<Name>name</Name>
				<Abstract>Abstract</Abstract>
				<Title>title</Title>
				<PointSymbolizer>
					<Graphic>
						<Size>
							<ogc:Literal>6</ogc:Literal>
						</Size>
						<Opacity>
							<ogc:Literal>1.0</ogc:Literal>
						</Opacity>
						<Mark>
							<WellKnownName>
								<ogc:Literal>circle</ogc:Literal>
							</WellKnownName>
							<Fill>
								<CssParameter name="fill">
									<ogc:Literal>#FFFFFF</ogc:Literal>
								</CssParameter>
							</Fill>
						</Mark>
					</Graphic>
				</PointSymbolizer>
				<PointSymbolizer>
					<Graphic>
						<Size>
							<ogc:Literal>4</ogc:Literal>
						</Size>
						<Opacity>
							<ogc:Literal>1.0</ogc:Literal>
						</Opacity>
						<Mark>
							<WellKnownName>
								<ogc:Literal>circle</ogc:Literal>
							</WellKnownName>
							<Fill>
								<CssParameter name="fill">
									<ogc:Literal>#000000</ogc:Literal>
								</CssParameter>
							</Fill>
						</Mark>
					</Graphic>
				</PointSymbolizer>
			</Rule>
		</FeatureTypeStyle>
	</UserStyle>
        </UserLayer>
</StyledLayerDescriptor>
